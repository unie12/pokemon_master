import { useState, useEffect } from "react";
import { teamApi } from "../services/api";
import "./MyPokemon.css";

const MyPokemon = ({ userId }) => {
  const [pokemons, setPokemons] = useState([]);
  const [slots, setSlots] = useState(Array(6).fill(null));

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await teamApi.getMyPokemons(userId);
        setPokemons(response.pokemons);
      } catch (error) {
        console.error("Error fetching user's pokemons:", error);
      }
    };
    fetchPokemons();
  }, [userId]);

  const handleAddToSlot = async (pokemon) => {
    const emptySlotIndex = slots.findIndex((slot) => slot === null);
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
      setSlots((prevSlots) => {
        const newSlots = [...prevSlots];
        newSlots[emptySlotIndex] = response.pokemon;
        return newSlots;
      });
    } catch (error) {
      console.error("Error adding pokemon to team:", error);
    }
  };

  const handleRemoveFromSlot = (index) => {
    const newSlots = [...slots];
    newSlots[index] = null;
    setSlots(newSlots);
  };

  return (
    <div className="my-pokemon-container">
      <h1>내 포켓몬</h1>

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
                <img src={slot.image_path} alt={slot.name} />
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
            <img src={pokemon.image_path} alt={pokemon.name} />
            <span>{pokemon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyPokemon;
