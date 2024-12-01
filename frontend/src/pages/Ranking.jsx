import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rankingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TeamComparison from './TeamComparison';
import './Ranking.css';

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const { user } = useAuth();

    const navigate = useNavigate();

    useEffect(() => {
        fetchRankings(currentPage);
    }, [currentPage]);

    const fetchRankings = async (page) => {
        setIsLoading(true);
        try {
            const response = await rankingApi.getRankings(page);
            setRankings(response.rankings);
            setTotalPages(Math.ceil(response.total_count / 10));
        } catch (error) {
            console.error('랭킹 조회 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeamClick = async (teamId) => {
        setIsLoading(true);
        try {
            const comparison = await rankingApi.compareTeams(teamId);
            if (comparison) {
                setSelectedTeam(comparison);
                setIsComparing(true);
            }
        } catch (error) {
            console.error('팀 비교 실패:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseComparison = () => {
        setSelectedTeam(null);
        setIsComparing(false);
    };

    return (
        <div className="ranking-container">
            <h2>팀 랭킹</h2>
            <div className="ranking-list">
                <table>
                    <thead>
                        <tr>
                            <th>순위</th>
                            <th>트레이너</th>
                            <th>포켓몬</th>
                            <th>총 스탯</th>
                            <th>포켓몬 수</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((rank) => (
                        <tr 
                            key={rank.team_id}
                            className={user && user.user_id && user.user_id === rank.user_id ? 'my-team' : ''}
                            onClick={() => handleTeamClick(rank.team_id)}
                            style={{ cursor: 'pointer' }}
                        >
                                <td>{rank.rank}</td>
                                <td>{rank.username}</td>
                                <td className="pokemon-images-container">
                                    <div className="pokemon-images">
                                        {rank.pokemon_ids.map((id) => (
                                            <div key={id} className="pokemon-image-wrapper">
                                                <img 
                                                    src={`http://localhost:5000/static/images/${id}.png`}
                                                    alt="pokemon"
                                                    className="pokemon-thumbnail"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/fallback-image.png';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td>{rank.total_stats}</td>
                                <td>{rank.pokemon_count}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTeam && isComparing && (
                <TeamComparison 
                    selectedTeam={selectedTeam}
                    onClose={handleCloseComparison}
                />
            )}

            <div className="pagination">
                {[...Array(totalPages)].map((_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => setCurrentPage(i + 1)}
                        className={currentPage === i + 1 ? 'active' : ''}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>

            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">Loading...</div>
                </div>
            )}
        </div>
    );
};

export default Ranking;