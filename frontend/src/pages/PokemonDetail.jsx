import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pokemonApi } from '../services/api';
import { TYPE_MAPPING } from '../utils/typeMapping';
import { calculateTypeEffectiveness, translateTypeEffectiveness } from '../utils/typeEffectiveness';
import StatsRadarChart from '../components/StatsRadarChart';
import './PokemonDetail.css';

const PokemonDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [pokemon, setPokemon] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPokemonDetail = async () => {
            try {
                const data = await pokemonApi.getPokemonDetail(id);
                setPokemon(data.pokemon);
            } catch (error) {
                console.error('Failed to load pokemon details:', error);
            } finally {
                setLoading(false);
            }
        };

        loadPokemonDetail();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!pokemon) return <div>Pokemon not found</div>;

    const typeEffectiveness = translateTypeEffectiveness(
        calculateTypeEffectiveness(pokemon.type1, pokemon.type2)
    );

    return (
        <div className="pokemon-detail-container">
            <div className="pokemon-detail-card">
                <div className="pokemon-image-section">
                    <img
                        src={`http://localhost:5000/static/images/${pokemon.id}.png`}
                        alt={pokemon.name}
                    />
                    <h5>{pokemon.name}</h5>
                    <div className="pokemon-types">
                        <span className={`type-badge ${pokemon.type1.toLowerCase()}`}>
                            {TYPE_MAPPING[pokemon.type1]}
                        </span>
                        {pokemon.type2 && (
                            <span className={`type-badge ${pokemon.type2.toLowerCase()}`}>
                                {TYPE_MAPPING[pokemon.type2]}
                            </span>
                        )}
                    </div>
                </div>

                <div className="pokemon-info-section">
                    <StatsRadarChart pokemon={pokemon} />

                    <div className="type-effectiveness">
                        <h3>타입 상성</h3>
                        <div className="effectiveness-grid">
                            <div className="weakness">
                                <h4>약점</h4>
                                {typeEffectiveness.약점.map(type => (
                                    <span key={type.className} className={`type-badge ${type.className}`}>
                                        {type.label}
                                    </span>
                                ))}
                            </div>
                            <div className="resistance">
                                <h4>저항</h4>
                                {typeEffectiveness.저항.map(type => (
                                    <span key={type.className} className={`type-badge ${type.className}`}>
                                        {type.label}
                                    </span>
                                ))}
                            </div>
                            <div className="immunity">
                                <h4>면역</h4>
                                {typeEffectiveness.면역.map(type => (
                                    <span key={type.className} className={`type-badge ${type.className}`}>
                                        {type.label}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="navigation-buttons">
                {pokemon.navigation?.prev_id && (
                    <button
                        className="nav-button prev"
                        onClick={() => navigate(`/pokemon/${pokemon.navigation.prev_id}`)}
                    >
                        이전
                    </button>
                )}
                <button
                    className="nav-button home"
                    onClick={() => navigate('/')}
                >
                    목록으로
                </button>
                {pokemon.navigation?.next_id && (
                    <button
                        className="nav-button next"
                        onClick={() => navigate(`/pokemon/${pokemon.navigation.next_id}`)}
                    >
                        다음
                    </button>
                )}
            </div>
        </div>
    );
};

export default PokemonDetail;