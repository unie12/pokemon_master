import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rankingApi, teamApi } from '../services/api';
import { TYPE_MAPPING } from '../utils/typeMapping.js';
import './TeamComparison.css';

const TeamComparison = ({ selectedTeam, onClose }) => {
    const { user } = useAuth();
    const [myTeam, setMyTeam] = useState(null);
    const [typeAnalysis, setTypeAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleClickOutside = (event) => {
        if (event.target.classList.contains('team-comparison-modal')) {
            onClose();
        }
    };
    
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEsc);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    useEffect(() => {
        const fetchTeamData = async () => {
            if (user && selectedTeam && user.user_id !== selectedTeam.user_id) {
                setIsLoading(true);
                try {
                    // 내 팀과 상대 팀의 타입 분석을 동시에 가져옴
                    const [myTeamResponse, myTypeAnalysis, opponentTypeAnalysis] = await Promise.all([
                        rankingApi.compareTeams(user.user_id),
                        teamApi.getTeamTypeAnalysis(user.user_id),
                        teamApi.getTeamTypeAnalysis(selectedTeam.team_id)
                    ]);
    
                    // 내 팀 데이터에 타입 분석 추가
                    setMyTeam({
                        ...myTeamResponse,
                        type_analysis: myTypeAnalysis
                    });
    
                    // 상대 팀 데이터에 타입 분석 추가
                    selectedTeam.type_analysis = opponentTypeAnalysis;
                    
                } catch (error) {
                    console.error('Data fetch failed:', error);
                } finally {
                    setIsLoading(false);
                }
            } else if (selectedTeam) {
                // 단일 팀 뷰일 때는 해당 팀의 타입 분석만 가져옴
                setIsLoading(true);
                try {
                    const typeAnalysis = await teamApi.getTeamTypeAnalysis(selectedTeam.team_id);
                    selectedTeam.type_analysis = typeAnalysis;
                } catch (error) {
                    console.error('Data fetch failed:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchTeamData();
    }, [user, selectedTeam]);


    const renderTypeAnalysis = (types) => (
        <div className="type-analysis">
            <div className="type-section">
                <h4>보유 타입</h4>
                <div className="type-tags">
                    {types.present_types.map(type => (
                        <span key={type} className={`type-tag ${type.toLowerCase()}`}>
                            {TYPE_MAPPING[type]}
                        </span>
                    ))}
                </div>
            </div>
            <div className="type-section">
                <h4>미보유 타입</h4>
                <div className="type-tags">
                    {types.missing_types.map(type => (
                        <span key={type} className={`type-tag ${type.toLowerCase()}`}>
                            {TYPE_MAPPING[type]}
                        </span>
                    ))}
                </div>
            </div>
            {types.weaknesses && (
                <div className="type-section">
                    <h4>취약 타입</h4>
                    <div className="type-tags">
                        {types.weaknesses.map(type => (
                            <span key={type} className={`type-tag weakness ${type.toLowerCase()}`}>
                                {TYPE_MAPPING[type]}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderPokemonList = (pokemons, isMyTeam = false) => (
        <div className="team-list">
            <div className="pokemon-row back">
                {pokemons.slice(0, 3).map((pokemon) => (
                    <div key={pokemon.id} className="team-pokemon-card">
                        <div className="pokemon-image-container">
                            <img 
                                src={`http://localhost:5000/static/images/${pokemon.id}.png`}
                                alt={pokemon.name}
                                className={isMyTeam ? 'mirror-image' : ''}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/fallback-image.png';
                                }}
                            />
                        </div>
                        <div className="pokemon-info">
                            <span className="pokemon-name">{pokemon.name}</span>
                            <span className="pokemon-type">
                                {TYPE_MAPPING[pokemon.type1]} {pokemon.type2 && `/ ${TYPE_MAPPING[pokemon.type2]}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <div className="pokemon-row front">
                {pokemons.slice(3, 5).map((pokemon) => (
                    <div key={pokemon.id} className="team-pokemon-card">
                        <div className="pokemon-image-container">
                            <img 
                                src={`http://localhost:5000/static/images/${pokemon.id}.png`}
                                alt={pokemon.name}
                                className={isMyTeam ? 'mirror-image' : ''}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/fallback-image.png';
                                }}
                            />
                        </div>
                        <div className="pokemon-info">
                            <span className="pokemon-name">{pokemon.name}</span>
                            <span className="pokemon-type">
                                {TYPE_MAPPING[pokemon.type1]} {pokemon.type2 && `/ ${TYPE_MAPPING[pokemon.type2]}`}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderStatComparison = (myValue, opponentValue, label) => {
        if (!myValue || !opponentValue) return null;
        return (
            <div className="stat-row">
                <span className={myValue > opponentValue ? 'winning' : ''}>
                    {myValue}
                </span>
                <label>{label}</label>
                <span className={opponentValue > myValue ? 'winning' : ''}>
                    {opponentValue}
                </span>
            </div>
        );
    };

    const renderSingleTeamView = () => (
        <div className="single-team-view">
            <h3>{selectedTeam.username}의 팀</h3>
            {renderPokemonList(selectedTeam.pokemons)}
            {selectedTeam.type_analysis && renderTypeAnalysis(selectedTeam.type_analysis)}

            <div className="team-stats">
                <div className="stat-row">
                    <label>HP</label>
                    <span>{selectedTeam.total_hp}</span>
                </div>
                <div className="stat-row">
                    <label>공격</label>
                    <span>{selectedTeam.total_attack}</span>
                </div>
                <div className="stat-row">
                    <label>방어</label>
                    <span>{selectedTeam.total_defense}</span>
                </div>
                <div className="stat-row">
                    <label>특수공격</label>
                    <span>{selectedTeam.total_sp_attack}</span>
                </div>
                <div className="stat-row">
                    <label>특수방어</label>
                    <span>{selectedTeam.total_sp_defense}</span>
                </div>
                <div className="stat-row">
                    <label>스피드</label>
                    <span>{selectedTeam.total_speed}</span>
                </div>
                <div className="stat-row total">
                    <label>총합</label>
                    <span>{selectedTeam.total_stats}</span>
                </div>
            </div>
        </div>
    );

    const renderComparisonView = () => {
        if (!myTeam) return <div>Loading...</div>;
        return (
            <>
                <div className="team-section my-team">
                    <h3>내 팀</h3>
                    {renderPokemonList(myTeam.pokemons, true)}
                    {myTeam.type_analysis && renderTypeAnalysis(myTeam.type_analysis)}
                </div>
                <div className="stats-comparison">
                    {renderStatComparison(myTeam.total_hp, selectedTeam.total_hp, 'HP')}
                    {renderStatComparison(myTeam.total_attack, selectedTeam.total_attack, '공격')}
                    {renderStatComparison(myTeam.total_defense, selectedTeam.total_defense, '방어')}
                    {renderStatComparison(myTeam.total_sp_attack, selectedTeam.total_sp_attack, '특수공격')}
                    {renderStatComparison(myTeam.total_sp_defense, selectedTeam.total_sp_defense, '특수방어')}
                    {renderStatComparison(myTeam.total_speed, selectedTeam.total_speed, '스피드')}
                    {renderStatComparison(myTeam.total_stats, selectedTeam.total_stats, '총합')}
                </div>
                <div className="team-section opponent-team">
                    <h3>{selectedTeam.username}의 팀</h3>
                    {renderPokemonList(selectedTeam.pokemons)}
                    {selectedTeam.type_analysis && renderTypeAnalysis(selectedTeam.type_analysis)}
                </div>
            </>
        );
    };

    const renderTeamView = () => {
        if (!selectedTeam) return null;
        return (!user || user.user_id === selectedTeam.user_id) 
            ? renderSingleTeamView() 
            : renderComparisonView();
    };

    if (!selectedTeam) return null;

    return (
        <div className="team-comparison-modal" onClick={handleClickOutside}>
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>×</button>
                <div className="teams-container">
                    {renderTeamView()}
                </div>
            </div>
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">Loading...</div>
                </div>
            )}
        </div>
    );
};

export default TeamComparison;