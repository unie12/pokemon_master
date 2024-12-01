import React, { useState } from 'react';
import { authApi } from '../services/api';
// import './RegisterForm.css';

const RegisterForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        username: '',
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
            const response = await authApi.register(formData);
            onSuccess(response.user);
        } catch (error) {
            setError(error.error || '회원가입에 실패했습니다.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="register-form">
            {error && <div className="error-message">{error}</div>}
            <div className="form-group">
                <label>사용자명:</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
            </div>
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
            <button type="submit">회원가입</button>
        </form>
    );
};

export default RegisterForm;