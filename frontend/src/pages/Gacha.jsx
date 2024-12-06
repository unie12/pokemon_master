import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { teamApi } from "../services/api"; // gacha API 추가됨
import GachaIcon from "../assets/images/gachaicon.png";
import { useAuth } from '../contexts/AuthContext';
import "./Gacha.css";

const Gacha = () => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cooldown, setCooldown] = useState(null);
  const [timer, setTimer] = useState(null);
  const [showPokemon, setShowPokemon] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    let interval;
    if (timer) {
      interval = setInterval(() => {
        setTimer(prevTimer => {
          if (prevTimer <= 1) {
            setCooldown(null);
            setError(null);
            return null;
          }
          return prevTimer - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}시간 ${minutes}분 ${secs}초`;
  };

  const handleCooldownError = (errorMsg) => {
    try {
      // COOLDOWN: 이후의 JSON 문자열 추출
      const jsonStr = errorMsg.split('COOLDOWN:')[1].trim();
      // PostgreSQL의 에러 컨텍스트 제거
      const cleanJsonStr = jsonStr.split('CONTEXT:')[0].trim();
      const cooldownData = JSON.parse(cleanJsonStr);

      const totalSeconds =
        (parseInt(cooldownData.hours) * 3600) +
        (parseInt(cooldownData.minutes) * 60) +
        parseInt(cooldownData.seconds);

      setTimer(totalSeconds);
      setCooldown(formatTime(totalSeconds));
    } catch (e) {
      console.error('Error parsing cooldown:', e);
      setError('가챠 쿨다운 중입니다.');
    }
  };

  const getRandomPokemon = async () => {
    if (!user?.user_id) {
      setError("로그인이 필요합니다.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await teamApi.gacha(user.user_id);

      if (!response.success) {
        if (response.error.includes('COOLDOWN:')) {
          handleCooldownError(response.error);
        } else {
          setError(response.error);
        }
        return;
      }

      setPokemon(response.pokemon);
      setShowPokemon(true);
    } catch (err) {
      setError("포켓몬 뽑기에 실패했습니다.");
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
            className={`gacha-ball ${loading ? 'spinning' : ''} ${cooldown ? 'disabled' : ''}`}
            onClick={!loading && !cooldown ? handleBallClick : undefined}
          />
          {cooldown && (
            <div className="cooldown-timer">
              다음 가챠까지 남은 시간:<br />
              {cooldown}
            </div>
          )}
        </div>

        {error && !cooldown && (
          <div className="error-message">
            {error}
          </div>
        )}

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
