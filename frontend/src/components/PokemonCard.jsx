// components/PokemonCard.jsx
import React from 'react';
import './PokemonCard.css'; 

const PokemonCard = ({ pokemon, onClick }) => {
    const imageUrl = `http://localhost:5000/static/images/${pokemon.id}.png`;
    
    return (
        <div className="pokemon-card" onClick={onClick}>
            <div className="pokemon-image">
                <img 
                    src={imageUrl} 
                    alt={pokemon.name}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/fallback-image.png';
                    }}
                />
            </div>
            <div className="pokemon-details">
                <span className="pokemon-number">No. {pokemon.pokedex_number}</span>
                <h3 className="pokemon-name">{pokemon.name}</h3>
                <div className="pokemon-info">
                    <span className="pokemon-type">
                        {pokemon.type1} {pokemon.type2 && `/ ${pokemon.type2}`}
                    </span>
                    <span className="pokemon-stat">
                        Total: {pokemon.total}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default PokemonCard;