import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import RegisterForm from '../components/RegisterForm';

import './Auth.css';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleAuthSuccess = (userData) => {
        login(userData);
        navigate('/');
    };

    return (
        <div className="auth-container">
            <div className="auth-form-container">
                <div className="auth-tabs">
                    <button 
                        className={isLogin ? 'active' : ''} 
                        onClick={() => setIsLogin(true)}
                    >
                        로그인
                    </button>
                    <button 
                        className={!isLogin ? 'active' : ''} 
                        onClick={() => setIsLogin(false)}
                    >
                        회원가입
                    </button>
                </div>
                {isLogin ? (
                    <LoginForm onSuccess={handleAuthSuccess} />
                ) : (
                    <RegisterForm onSuccess={handleAuthSuccess} />
                )}
            </div>
        </div>
    );
};

export default Auth;