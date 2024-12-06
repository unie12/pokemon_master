import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { teamApi } from "../services/api"; // gacha API 추가됨
import GachaIcon from "../assets/images/gachaicon.png";
import { useAuth } from '../contexts/AuthContext';
import "./Gacha.css";

const Gacha = () => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPokemon, setShowPokemon] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const getRandomPokemon = async () => {
    if (!user?.user_id) {
      setError("로그인이 필요합니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await teamApi.gacha(user.user_id);

      if (response.error) {
        setError(response.error);
        return;
      }

      setPokemon(response.pokemon); 
      setShowPokemon(true);
    } catch (err) {
      setError("Failed to fetch random Pokémon");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBallClick = async () => {
    if (!user?.user_id) {
      alert("로그인이 필요한 서비스입니다.");
      navigate("/");
      return;
    }

    setShowPokemon(false);
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
      <h1 className="gacha-title">
        몬스터볼을 클릭해서<br />
        당신의 포켓몬을 획득하세요!
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

        {showPokemon && pokemon && (
          <>
            <div className="pokemon-result-container">
              <div className="gacha-pokemon-card" onClick={handlePokemonClick}>
                <img
                  src={`http://localhost:5000${pokemon.image_path}`}
                  alt={pokemon.name}
                />
              </div>
            </div>
            <h2 className="result-message">
              축하합니다! {pokemon.name}를 획득했습니다!
            </h2>
            <button
              className="my-team-button"
              onClick={() => navigate("/mypokemon")}
            >
              나의 팀으로 이동하기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Gacha;
