import React from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import MainLogo from "../assets/images/main_logo.png";
import "./Header.css";

const Header = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      logout();
      navigate("/");
    } catch (error) {
      console.error("로그아웃 실패:", error);
    }
  };

  return (
    <header className="header">
      <nav>
        <div className="nav-left">
          <h1 onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
            <img src={MainLogo} alt="Main Logo" />
          </h1>
        </div>
        <div className="nav-right">
          <p onClick={() => navigate("/ranking")} className="ranking-btn">
            랭킹
          </p>
          <p onClick={() => navigate("/gacha")} className="gacha-btn">
            뽑기
          </p>
          <p onClick={() => navigate("/mypokemon")} className="mypok-btn">
            나의 팀
          </p>
          {user ? (
            <div className="user-info">
              <span>{user.username}님 환영합니다!</span>
              <p onClick={handleLogout}>로그아웃</p>
            </div>
          ) : (
            <p onClick={() => navigate("/auth")}>로그인</p>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;
