import { useState, useEffect } from "react";
import { teamApi } from "../services/api";
import { useAuth } from '../contexts/AuthContext';
import FilterPanel from "../components/FilterPanel";
import { TYPE_MAPPING, REVERSE_TYPE_MAPPING } from '../utils/typeMapping';

import "./MyPokemon.css";

const MyPokemon = () => {
  const [pokemons, setPokemons] = useState([]);
  const [slots, setSlots] = useState(Array(6).fill(null));
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const { user } = useAuth();

  const [sortBy, setSortBy] = useState("pokedex_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [filteredPokemons, setFilteredPokemons] = useState([]);
  const [teamStats, setTeamStats] = useState(null);
  const [teamTypeAnalysis, setTeamTypeAnalysis] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      if (!user?.user_id) return;
  
      try {
        const [teamResponse, pokemonsResponse] = await Promise.all([
          teamApi.getUserTeam(user.user_id),
          teamApi.getMyPokemons(user.user_id)
        ]);
  
        if (teamResponse.team) {
          setTeam(teamResponse.team);
          setTeamName(teamResponse.team.name);
          
          // 팀 통계, 슬롯, 타입 분석 정보 가져오기
          const [slotsResponse, statsResponse, typeAnalysisResponse] = await Promise.all([
            teamApi.getTeamPokemons(teamResponse.team.id),
            teamApi.getTeamStats(teamResponse.team.id),
            teamApi.getTeamTypeAnalysis(teamResponse.team.id)
          ]);
  
          if (slotsResponse.success && slotsResponse.slots) {
            setSlots(slotsResponse.slots);
          }

          if (statsResponse.success) {
            setTeamStats(statsResponse.stats);
          }

          setTeamTypeAnalysis(typeAnalysisResponse);
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

  const handleUpdateTeam = async () => {
    if (!teamName.trim()) {
      alert("팀 이름을 입력해주세요.");
      return;
    }

    try {
      const response = await teamApi.createTeam(user.user_id, teamName);
      if (response.success) {
        setTeam(response.team);
      }
    } catch (error) {
      console.error("Error updating team:", error);
      alert(error.message);
    }
  };

  const handleAddToSlot = async (pokemon) => {
    if (!team) {
      alert("팀을 먼저 생성해주세요.");
      return;
    }

    const emptySlotIndex = slots.findIndex(slot => slot === null);
    if (emptySlotIndex === -1) {
      alert("모든 슬롯이 채워졌습니다. 기존 슬롯에서 포켓몬을 제거해주세요.");
      return;
    }

    try {
      const response = await teamApi.addPokemonToTeam(
        team.id,
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
      }
    } catch (error) {
      console.error("Error adding pokemon:", error);
      alert(error.message || "포켓몬 추가 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveFromSlot = async (index) => {
    if (!team) return;

    try {
      const response = await teamApi.removePokemonFromTeam(team.id, index + 1);
      if (response.success) {
        // 즉시 UI 업데이트
        setSlots(prev => {
          const newSlots = [...prev];
          newSlots[index] = null;
          return newSlots;
        });
      }
    } catch (error) {
      console.error("Error removing pokemon:", error);
      alert(error.message);
    }
  };

  const availableTypes = [
    "노말", "불꽃", "물", "전기", "풀", "얼음", "격투", "독", 
    "땅", "비행", "에스퍼", "벌레", "바위", "고스트", 
    "드래곤", "악", "강철", "페어리"
  ];

  // 포켓몬 필터링 및 정렬 로직
  useEffect(() => {
    let filtered = [...pokemons];

    // 타입 필터링
    if (selectedTypes.length > 0) {
      filtered = filtered.filter(pokemon => {
        // 영어 타입을 한글로 변환하여 비교
        const pokemonType1 = TYPE_MAPPING[pokemon.type1] || pokemon.type1;
        const pokemonType2 = TYPE_MAPPING[pokemon.type2] || pokemon.type2;
        
        return selectedTypes.some(selectedType => 
          pokemonType1 === selectedType || pokemonType2 === selectedType
        );
      });
    }

    // 정렬
    filtered.sort((a, b) => {
      const aValue = a[sortBy] || 0;
      const bValue = b[sortBy] || 0;
      
      if (typeof aValue === 'string') {
        return sortOrder === "asc" 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortOrder === "asc" 
        ? aValue - bValue 
        : bValue - aValue;
    });

    setFilteredPokemons(filtered);
  }, [pokemons, sortBy, sortOrder, selectedTypes]);

  // 팀 통계 표시 섹션 추가
  const renderTeamStats = () => {
    if (!teamStats) return null;
  
    return (
      <div className="team-stats-section">
        <h2>팀 통계</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <span>총 스탯:</span>
            <span>{teamStats.total_stats}</span>
          </div>
          <div className="stat-item">
            <span>총 HP:</span>
            <span>{teamStats.total_hp}</span>
          </div>
          <div className="stat-item">
            <span>총 공격력:</span>
            <span>{teamStats.total_attack}</span>
          </div>
          <div className="stat-item">
            <span>총 방어력:</span>
            <span>{teamStats.total_defense}</span>
          </div>
          <div className="stat-item">
            <span>총 특수공격:</span>
            <span>{teamStats.total_sp_attack}</span>
          </div>
          <div className="stat-item">
            <span>총 특수방어:</span>
            <span>{teamStats.total_sp_defense}</span>
          </div>
          <div className="stat-item">
            <span>총 스피드:</span>
            <span>{teamStats.total_speed}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderTypeAnalysis = () => {
    if (!teamTypeAnalysis?.type_analysis) return null;  // null 체크 추가
  
    const { present_types, missing_types } = teamTypeAnalysis.type_analysis;
  
    return (
      <div className="type-analysis-section">
        <h3>타입 분석</h3>
        <div className="analysis-type-grid">
          <div className="type-category">
            <h4>보유 타입</h4>
            <div className="type-tags">
              {present_types?.map(type => (
                <span key={type} className={`type-tag ${type.toLowerCase()}`}>
                  {TYPE_MAPPING[type]}
                </span>
              ))}
            </div>
          </div>
          <div className="type-category">
            <h4>미보유 타입</h4>
            <div className="type-tags">
              {missing_types?.map(type => (
                <span key={type} className={`type-tag ${type.toLowerCase()}`}>
                  {TYPE_MAPPING[type]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="my-pokemon-container">
      <h1>내 포켓몬</h1>

      {/* 팀 이름 섹션 */}
      <div className="team-name-section">
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          placeholder="팀 이름 입력"
        />
        <button onClick={handleUpdateTeam}>
          {team ? '팀 이름 수정' : '팀 생성'}
        </button>
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

      {team && renderTeamStats()}
      {team && renderTypeAnalysis()}

      {/* FilterPanel 추가 */}
      <FilterPanel
        sortBy={sortBy}
        sortOrder={sortOrder}
        selectedTypes={selectedTypes}
        onSortChange={setSortBy}
        onSortOrderChange={setSortOrder}
        onTypeToggle={(type) => {
          setSelectedTypes(prev =>
            prev.includes(type)
              ? prev.filter(t => t !== type)
              : [...prev, type]
          );
        }}
        availableTypes={availableTypes}
      />

      {/* 포켓몬 리스트 */}
      <h2>보유한 포켓몬</h2>
      <div className="my-pokemon-list">
        {filteredPokemons.map((pokemon) => (
          <div
            key={pokemon.id}
            className="my-pokemon-item"
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