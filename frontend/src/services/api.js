import axios from "axios";

const API_URL = "http://localhost:5000/api";

export const pokemonApi = {
  getPokemons: async (page, sortBy, sortOrder, types) => {
    try {
      const params = new URLSearchParams({
        page,
        sort_by: sortBy,
        sort_order: sortOrder,
      });

      if (types && types.length > 0) {
        types.forEach((type) => params.append("types[]", type));
      }

      const response = await axios.get(`${API_URL}/pokemons?${params}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pokemons:", error);
      throw error;
    }
  },

  getPokemonDetail: async (id) => {
    try {
      const response = await axios.get(`${API_URL}/pokemon/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching pokemon detail:", error);
      throw error;
    }
  },
};

export const authApi = {
  register: async (userData) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error.response.data;
    }
  },

  login: async (credentials) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, credentials);
      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error.response.data;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post(`${API_URL}/auth/logout`);
      return response.data;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  },
};

export const rankingApi = {
  getRankings: async (page = 1, perPage = 10) => {
    try {
      const response = await axios.get(
        `${API_URL}/rankings?page=${page}&per_page=${perPage}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching rankings:", error);
      throw error;
    }
  },

  compareTeams: async (teamId) => {
    try {
      const response = await axios.get(`${API_URL}/rankings/compare/${teamId}`);
      return response.data;
    } catch (error) {
      console.error("Error comparing teams:", error);
      throw error;
    }
  },
};

export const teamApi = {
  getTeamTypeAnalysis: async (teamId) => {
    try {
      const response = await axios.get(`${API_URL}/teams/${teamId}/type-analysis`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team type analysis:', error);
      throw error;
    }
  },

  getMyPokemons: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/teams/${userId}/pokemons`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user's pokemons:", error);
      throw error;
    }
  },

  gacha: async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/gacha`, {
        user_id: userId,
      });
      return response.data;
    } catch (error) {
      console.error("Gacha request error:", error);
      throw error;
    }
  },

  addPokemonToTeam: async (teamId, pokemonId, slotNumber) => {
    try {
      const response = await axios.post(
        `${API_URL}/teams/${teamId}/add-pokemon`,
        {
          pokemon_id: pokemonId,
          slot_number: slotNumber,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error adding pokemon to team:", error);
      throw error;
    }
  },

  getTeams: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/teams/${userId}`);
      if (!response.data.success) {
        throw new Error(response.data.error);
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching teams:", error);
      throw {
        success: false,
        error: error.response?.data?.error || error.message
      };
    }
  },

  getTeamPokemons: async (teamId) => {
    try {
      const response = await axios.get(`${API_URL}/teams/${teamId}/pokemons`);
      return response.data;
    } catch (error) {
      console.error("Error fetching team pokemons:", error);
      throw error;
    }
  },

  createTeam: async (userId, teamName) => {
    try {
      const response = await axios.post(`${API_URL}/teams`, {
        user_id: userId,
        team_name: teamName
      });
      return response.data;
    } catch (error) {
      console.error("Error creating team:", error);
      throw error;
    }
  },

  removePokemonFromTeam: async (teamId, slotNumber) => {
    try {
      const response = await axios.delete(
        `${API_URL}/teams/${teamId}/pokemon/${slotNumber}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing pokemon from team:", error);
      throw error;
    }
  }
};
