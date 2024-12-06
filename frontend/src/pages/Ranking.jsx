import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { rankingApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import TeamComparison from './TeamComparison';
import './Ranking.css';

const Ranking = () => {
    const [rankings, setRankings] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const { user } = useAuth();
    const observer = useRef();

    const lastRankingElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setCurrentPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, hasMore]);

    useEffect(() => {
        fetchRankings(currentPage);
    }, [currentPage]);

    const fetchRankings = async (page) => {
        if (isLoading) return;
        setIsLoading(true);
        try {
            const response = await rankingApi.getRankings(page);
            setRankings(prev => {
                if (page === 1) return response.rankings;
                return [...prev, ...response.rankings];
            });
            setHasMore(response.rankings.length === 10);
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
                        </tr>
                    </thead>
                    <tbody>
                        {rankings.map((rank, index) => (
                            <tr 
                                key={`${rank.team_id}-${index}`}
                                ref={index === rankings.length - 1 ? lastRankingElementRef : null}
                                className={user?.user_id === rank.user_id ? 'my-team' : ''}
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
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedTeam && isComparing && (
                <TeamComparison 
                    selectedTeam={selectedTeam}
                    onClose={() => {
                        setSelectedTeam(null);
                        setIsComparing(false);
                    }}
                />
            )}

            {isLoading && (
                <div className="loading-spinner">Loading...</div>
            )}
        </div>
    );
};

export default Ranking;