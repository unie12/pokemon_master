import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const pokemonApi = {
    getPokemons: async (page, sortBy, sortOrder, types) => {
        try {
            const params = new URLSearchParams({
                page,
                sort_by: sortBy,
                sort_order: sortOrder
            });

            if (types && types.length > 0) {
                types.forEach(type => params.append('types[]', type));
            }

            const response = await axios.get(`${API_URL}/pokemons?${params}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching pokemons:', error);
            throw error;
        }
    },
    
    getPokemonDetail: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/pokemon/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching pokemon detail:', error);
            throw error;
        }
    }
};