# routes/pokemon.py
from flask import Blueprint, jsonify, request
from services.pokemon_service import PokemonService
from config.database import get_db_connection 

pokemon_bp = Blueprint('pokemon', __name__)
pokemon_service = PokemonService(get_db_connection)  

@pokemon_bp.route('/pokemons')
def get_pokemons():
    page = request.args.get('page', 1, type=int)
    sort_by = request.args.get('sort_by', 'pokedex_number')
    sort_order = request.args.get('sort_order', 'asc')
    types = request.args.getlist('types[]')
    
    try:
        result = pokemon_service.get_pokemons(page, sort_by, sort_order, types)
        return jsonify(result)
    except Exception as e:
        print(f"Error in get_pokemons: {str(e)}") 
        return jsonify({'error': str(e)}), 500

@pokemon_bp.route('/pokemon/<int:id>')
def pokemon_detail(id):
    try:
        result = pokemon_service.get_pokemon_detail(id)
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500