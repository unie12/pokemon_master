import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pokemonApi } from "../services/api"; // gacha API 추가됨
import GachaIcon from "../assets/images/gachaicon.png";
import PokemonCard from "../components/PokemonCard";
import "./Gacha.css";

const Gacha = () => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPokemon, setShowPokemon] = useState(false);
  const navigate = useNavigate();

  const getRandomPokemon = async () => {
    try {
      setLoading(true);
      setError(null);
      const userId = 1; // 예시로 user_id를 1로 설정. 실제 구현에서는 인증 상태로부터 가져와야 함.
      // gacha API 호출
      const response = await pokemonApi.gacha(userId);

      if (response.error) {
        setError(response.error);
        return;
      }

      // 획득한 포켓몬 데이터 저장
      setPokemon(response.pokemon); // API 구조에 따라 조정 필요
      setShowPokemon(true);
    } catch (err) {
      setError("Failed to fetch random Pokémon");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBallClick = async () => {
    setShowPokemon(false); // 이전 포켓몬 숨기기
    await getRandomPokemon();
  };

  const handlePokemonClick = () => {
    if (pokemon) {
      navigate(`/pokemon/${pokemon.id}`); // `pokemon.id`는 API 응답에 따라 수정 필요
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="gacha-container">
      <h1>
        몬스터볼을 클릭해서
        <br /> 당신의 포켓몬을 획득하세요!
      </h1>
      <div className="gacha-content">
        <div className="gacha-ball-container">
          <img
            src={GachaIcon}
            alt="Gacha Ball"
            className="gacha-ball"
            onClick={handleBallClick}
          />
        </div>
        <hr />
        {showPokemon && pokemon && (
          <div className="complete-container" onClick={handlePokemonClick}>
            <PokemonCard
              key={pokemon.id} // API 응답에 맞게 수정
              pokemon={pokemon}
            />
          </div>
        )}
        {showPokemon && pokemon && <h2>You Got the {pokemon.name}!!!</h2>}
        {showPokemon && (
          <button
            className="my-team-button"
            onClick={() => navigate("/mypokemon")}
          >
            나의 팀으로 이동하기
          </button>
        )}
      </div>
    </div>
  );
};

export default Gacha;
