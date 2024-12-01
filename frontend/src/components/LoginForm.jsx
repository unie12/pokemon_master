import React, { useState } from 'react';
import { authApi } from '../services/api';
// import './LoginForm.css';

const LoginForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authApi.login(formData);
            onSuccess(response.user);
        } catch (error) {
            setError(error.error || '로그인에 실패했습니다.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label>이메일:</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label>비밀번호:</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
            </div>
            <button type="submit">로그인</button>
        </form>
    );
};

export default LoginForm;