import React from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await authApi.logout();
            logout();
            navigate('/');
        } catch (error) {
            console.error('로그아웃 실패:', error);
        }
    };

    return (
        <header className="header">
            <nav>
                <div className="nav-left">
                    <h1 onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                        포켓몬 마스터
                    </h1>
                </div>
                <div className="nav-right">
                    {user ? (
                        <div className="user-info">
                            <span>{user.username}님 환영합니다!</span>
                            <button onClick={handleLogout}>로그아웃</button>
                        </div>
                    ) : (
                        <button onClick={() => navigate('/auth')}>로그인</button>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default Header;