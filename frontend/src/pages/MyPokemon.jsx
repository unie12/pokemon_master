import { useState, useEffect } from "react";
import { teamApi } from "../services/api";
import { useAuth } from '../contexts/AuthContext';
import "./MyPokemon.css";

const MyPokemon = () => {
  const [pokemons, setPokemons] = useState([]);
  const [slots, setSlots] = useState(Array(6).fill(null));
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [newTeamName, setNewTeamName] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;

      try {
        const [teamsResponse, pokemonsResponse] = await Promise.all([
          teamApi.getTeams(user.user_id),
          teamApi.getMyPokemons(user.user_id)
        ]);

        if (teamsResponse.teams) {
          setTeams(teamsResponse.teams);
        }
        if (pokemonsResponse.pokemons) {
          setPokemons(pokemonsResponse.pokemons);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [user]);

  const handleTeamSelect = async (teamId) => {
    const id = parseInt(teamId, 10);
    setSelectedTeam(id);

    if (!id) {
      setSlots(Array(6).fill(null));
      return;
    }

    try {
      const response = await teamApi.getTeamPokemons(id);
      if (response.success && response.slots) {
        setSlots(response.slots);
      }
    } catch (error) {
      console.error("Error fetching team slots:", error);
      setSlots(Array(6).fill(null));
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      alert("팀 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await teamApi.createTeam(user.user_id, newTeamName);
      if (response.success) {
        const updatedTeamsResponse = await teamApi.getTeams(user.user_id);
        setTeams(updatedTeamsResponse.teams);
        setNewTeamName("");
      }
    } catch (error) {
      console.error("Error creating team:", error);
      alert(error.message);
    }
  };

  const handleAddToSlot = async (pokemon) => {
    if (!selectedTeam) {
      alert("팀을 먼저 선택해주세요.");
      return;
    }

    const emptySlotIndex = slots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      alert("모든 슬롯이 채워졌습니다. 기존 슬롯에서 포켓몬을 제거해주세요.");
      return;
    }

    try {
      const response = await teamApi.addPokemonToTeam(
        selectedTeam,
        pokemon.id,
        emptySlotIndex + 1
      );

      if (response.success) {
        // 즉시 UI 업데이트
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[emptySlotIndex] = {
            id: pokemon.id,
            name: pokemon.name,
            type1: pokemon.type1,
            type2: pokemon.type2,
            image_path: pokemon.image_path
          };
          return newSlots;
        });

        // 서버에서 최신 데이터 가져오기
        const updatedResponse = await teamApi.getTeamPokemons(selectedTeam);
        if (updatedResponse.success) {
          setSlots(updatedResponse.slots);
        }
      }
    } catch (error) {
      console.error("Error adding pokemon:", error);
      alert(error.message || "포켓몬 추가 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveFromSlot = async (index) => {
    if (!selectedTeam) return;

    try {
      const response = await teamApi.removePokemonFromTeam(selectedTeam, index + 1);
      if (response.success) {
        const updatedResponse = await teamApi.getTeamPokemons(selectedTeam);
        if (updatedResponse.success) {
          setSlots(updatedResponse.slots);
        }
      }
    } catch (error) {
      console.error("Error removing pokemon:", error);
      alert(error.message);
    }
  };

  return (
    <div className="my-pokemon-container">
      <h1>내 포켓몬</h1>

      {/* 팀 생성 섹션 */}
      <div className="team-creator">
        <h2>새 팀 만들기</h2>
        <input
          type="text"
          value={newTeamName}
          onChange={(e) => setNewTeamName(e.target.value)}
          placeholder="팀 이름 입력"
        />
        <button onClick={handleCreateTeam}>팀 생성</button>
      </div>

      {/* 팀 선택 섹션 */}
      <div className="team-selector">
        <h2>팀 선택</h2>
        <select
          value={selectedTeam || ''}
          onChange={(e) => handleTeamSelect(e.target.value)}
        >
          <option value="">팀을 선택하세요</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* 슬롯 섹션 */}
      <div className="pokemon-slots">
        {slots.map((slot, index) => (
          <div
            key={index}
            className={`slot ${slot ? "filled" : "empty"}`}
            onClick={() => {
              if (slot) {
                handleRemoveFromSlot(index);
              }
            }}
          >
            {slot ? (
              <>
                <img src={`http://localhost:5000${slot.image_path}`} alt={slot.name} />
                <span>{slot.name}</span>
              </>
            ) : (
              <span>빈 슬롯</span>
            )}
          </div>
        ))}
      </div>

      {/* 포켓몬 리스트 */}
      <h2>보유한 포켓몬</h2>
      <div className="pokemon-list">
        {pokemons.map((pokemon) => (
          <div
            key={pokemon.id}
            className="pokemon-item"
            onClick={() => handleAddToSlot(pokemon)}
          >
            <img src={`http://localhost:5000${pokemon.image_path}`} alt={pokemon.name} />
            <span>{pokemon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPokemon;