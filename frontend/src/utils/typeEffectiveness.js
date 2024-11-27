// src/utils/typeEffectiveness.js
import { TYPE_MAPPING } from './typeMapping';

const TYPE_EFFECTIVENESS = {
    Normal: {
      weakness: ['Fighting'],
      resistance: [],
      immunity: ['Ghost']
    },
    Fire: {
      weakness: ['Water', 'Ground', 'Rock'],
      resistance: ['Fire', 'Grass', 'Ice', 'Bug', 'Steel', 'Fairy'],
      immunity: []
    },
    Water: {
      weakness: ['Electric', 'Grass'],
      resistance: ['Fire', 'Water', 'Ice', 'Steel'],
      immunity: []
    },
    Electric: {
      weakness: ['Ground'],
      resistance: ['Electric', 'Flying', 'Steel'],
      immunity: []
    },
    Grass: {
      weakness: ['Fire', 'Ice', 'Poison', 'Flying', 'Bug'],
      resistance: ['Water', 'Electric', 'Grass', 'Ground'],
      immunity: []
    },
    Ice: {
      weakness: ['Fire', 'Fighting', 'Rock', 'Steel'],
      resistance: ['Ice'],
      immunity: []
    },
    Fighting: {
      weakness: ['Flying', 'Psychic', 'Fairy'],
      resistance: ['Bug', 'Rock', 'Dark'],
      immunity: []
    },
    Poison: {
      weakness: ['Ground', 'Psychic'],
      resistance: ['Fighting', 'Poison', 'Bug', 'Grass', 'Fairy'],
      immunity: []
    },
    Ground: {
      weakness: ['Water', 'Grass', 'Ice'],
      resistance: ['Poison', 'Rock'],
      immunity: ['Electric']
    },
    Flying: {
      weakness: ['Electric', 'Ice', 'Rock'],
      resistance: ['Fighting', 'Bug', 'Grass'],
      immunity: ['Ground']
    },
    Psychic: {
      weakness: ['Bug', 'Ghost', 'Dark'],
      resistance: ['Fighting', 'Psychic'],
      immunity: []
    },
    Bug: {
      weakness: ['Fire', 'Flying', 'Rock'],
      resistance: ['Fighting', 'Grass', 'Ground'],
      immunity: []
    },
    Rock: {
      weakness: ['Water', 'Grass', 'Fighting', 'Ground', 'Steel'],
      resistance: ['Normal', 'Fire', 'Poison', 'Flying'],
      immunity: []
    },
    Ghost: {
      weakness: ['Ghost', 'Dark'],
      resistance: ['Poison', 'Bug'],
      immunity: ['Normal', 'Fighting']
    },
    Dragon: {
      weakness: ['Ice', 'Dragon', 'Fairy'],
      resistance: ['Fire', 'Water', 'Electric', 'Grass'],
      immunity: []
    },
    Dark: {
      weakness: ['Fighting', 'Bug', 'Fairy'],
      resistance: ['Ghost', 'Dark'],
      immunity: ['Psychic']
    },
    Steel: {
      weakness: ['Fire', 'Fighting', 'Ground'],
      resistance: ['Normal', 'Grass', 'Ice', 'Flying', 'Psychic', 'Bug', 'Rock', 'Dragon', 'Steel', 'Fairy'],
      immunity: ['Poison']
    },
    Fairy: {
      weakness: ['Poison', 'Steel'],
      resistance: ['Fighting', 'Bug', 'Dark'],
      immunity: ['Dragon']
    }
  };
  export const calculateTypeEffectiveness = (type1, type2 = null) => {
    const effectiveness = {
      weakness: new Set(),
      resistance: new Set(),
      immunity: new Set()
    };
    
    [type1, type2].filter(Boolean).forEach(type => {
      const typeEffect = TYPE_EFFECTIVENESS[type];
      if (typeEffect) {
        typeEffect.weakness.forEach(t => effectiveness.weakness.add(t));
        typeEffect.resistance.forEach(t => effectiveness.resistance.add(t));
        typeEffect.immunity.forEach(t => effectiveness.immunity.add(t));
      }
    });
    
    return effectiveness;
  };
  
export const translateTypeEffectiveness = (effectiveness) => {
  return {
    약점: [...effectiveness.weakness].map(type => ({
      className: type.toLowerCase(),
      label: TYPE_MAPPING[type]
    })),
    저항: [...effectiveness.resistance].map(type => ({
      className: type.toLowerCase(),
      label: TYPE_MAPPING[type]
    })),
    면역: [...effectiveness.immunity].map(type => ({
      className: type.toLowerCase(),
      label: TYPE_MAPPING[type]
    }))
  };
};