import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { rankingApi } from '../services/api';
import './TeamComparison.css';

const TeamComparison = ({ selectedTeam, onClose }) => {
    const { user } = useAuth();
    const [myTeam, setMyTeam] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMyTeam = async () => {
            if (user && selectedTeam && user.user_id !== selectedTeam.user_id) {
                setIsLoading(true);
                try {
                    const myTeamResponse = await rankingApi.compareTeams(user.user_id);
                    setMyTeam(myTeamResponse);
                } catch (error) {
                    console.error('내 팀 정보 조회 실패:', error);
                } finally {
                    setIsLoading(false);
                }
            }
        };
        fetchMyTeam();
    }, [user, selectedTeam]);

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
            <div className="pokemon-list">
                {selectedTeam.pokemons.map((pokemon) => (
                    <div key={pokemon.id} className="pokemon-card">
                        <img 
                            src={`http://localhost:5000/static/images/${pokemon.id}.png`}
                            alt={pokemon.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/fallback-image.png';
                            }}
                        />
                        <span className="pokemon-name">{pokemon.name}</span>
                        <span className="pokemon-type">
                            {pokemon.type1} {pokemon.type2 && `/ ${pokemon.type2}`}
                        </span>
                    </div>
                ))}
            </div>
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
                    <div className="pokemon-list">
                        {myTeam.pokemons.map((pokemon) => (
                            <div key={pokemon.id} className="pokemon-card">
                                <img 
                                    src={`http://localhost:5000/static/images/${pokemon.id}.png`}
                                    alt={pokemon.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/fallback-image.png';
                                    }}
                                />
                                <span className="pokemon-name">{pokemon.name}</span>
                                <span className="pokemon-type">
                                    {pokemon.type1} {pokemon.type2 && `/ ${pokemon.type2}`}
                                </span>
                            </div>
                        ))}
                    </div>
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
                    <div className="pokemon-list">
                        {selectedTeam.pokemons.map((pokemon) => (
                            <div key={pokemon.id} className="pokemon-card">
                                <img 
                                    src={`http://localhost:5000/static/images/${pokemon.id}.png`}
                                    alt={pokemon.name}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = '/fallback-image.png';
                                    }}
                                />
                                <span className="pokemon-name">{pokemon.name}</span>
                                <span className="pokemon-type">
                                    {pokemon.type1} {pokemon.type2 && `/ ${pokemon.type2}`}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    };

    const renderTeamView = () => {
        if (!selectedTeam) return null;
        
        // 로그인하지 않았거나 자신의 팀인 경우 단일 팀 뷰
        if (!user || user.user_id === selectedTeam.user_id) {
            return renderSingleTeamView();
        }
        
        // 다른 사람의 팀인 경우 비교 뷰
        return renderComparisonView();
    };

    if (!selectedTeam) return null;

    return (
        <div className="team-comparison-modal">
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