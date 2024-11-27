// components/FilterPanel.jsx
import React, { useState, useEffect } from 'react';
import './FilterPanel.css';

const FilterPanel = ({ 
    sortBy, 
    sortOrder, 
    selectedTypes, 
    onSortChange, 
    onSortOrderChange,
    onTypeToggle,
    availableTypes 
}) => {
    const [isStatMenuOpen, setIsStatMenuOpen] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isStatMenuOpen && !event.target.closest('.dropdown')) {
                setIsStatMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isStatMenuOpen]);
    
    const sortOptions = [
        { value: 'pokedex_number', label: '도감 번호' },
        { value: 'total', label: '총 스탯' },
        { value: 'hp', label: 'HP' },
        { value: 'attack', label: '공격력' },
        { value: 'defense', label: '방어력' },
        { value: 'sp_attack', label: '특수공격' },
        { value: 'sp_defense', label: '특수방어' },
        { value: 'speed', label: '스피드' }
    ];

    const handleSortClick = (value) => {
        onSortChange(value);
        setIsStatMenuOpen(false);
    };

    return (
        <div className="filter-panel">
            <div className="filter-section">
                <div className="sort-container">
                    <div className="dropdown">
                        <button 
                            className="dropdown-button"
                            onClick={() => setIsStatMenuOpen(!isStatMenuOpen)}
                        >
                            {sortOptions.find(opt => opt.value === sortBy)?.label || '정렬 기준'}
                        </button>
                        {isStatMenuOpen && (
                            <div className="dropdown-content">
                                {sortOptions.map(option => (
                                    <div
                                        key={option.value}
                                        className={`dropdown-item ${sortBy === option.value ? 'active' : ''}`}
                                        onClick={() => handleSortClick(option.value)}
                                    >
                                        {option.label}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="order-buttons">
                        <button 
                            className={`order-button ${sortOrder === 'asc' ? 'active' : ''}`}
                            onClick={() => onSortOrderChange('asc')}
                        >
                            ↑
                        </button>
                        <button 
                            className={`order-button ${sortOrder === 'desc' ? 'active' : ''}`}
                            onClick={() => onSortOrderChange('desc')}
                        >
                            ↓
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="filter-section">
                <h3>타입</h3>
                <div className="type-grid">
                    {availableTypes.map(type => {
                        const typeClass = type === '노말' ? 'normal' :
                                        type === '불꽃' ? 'fire' :
                                        type === '물' ? 'water' :
                                        type === '전기' ? 'electric' :
                                        type === '풀' ? 'grass' :
                                        type === '얼음' ? 'ice' :
                                        type === '격투' ? 'fighting' :
                                        type === '독' ? 'poison' :
                                        type === '땅' ? 'ground' :
                                        type === '비행' ? 'flying' :
                                        type === '에스퍼' ? 'psychic' :
                                        type === '벌레' ? 'bug' :
                                        type === '바위' ? 'rock' :
                                        type === '고스트' ? 'ghost' :
                                        type === '드래곤' ? 'dragon' :
                                        type === '악' ? 'dark' :
                                        type === '강철' ? 'steel' :
                                        type === '페어리' ? 'fairy' : '';
                        
                        return (
                            <button
                                key={type}
                                className={`type-button ${typeClass} ${selectedTypes.includes(type) ? 'active' : ''}`}
                                onClick={() => onTypeToggle(type)}
                            >
                                {type}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default FilterPanel;