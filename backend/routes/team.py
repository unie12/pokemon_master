from flask import Blueprint, jsonify, request
from services.team_service import TeamService
from config.database import get_db_connection

team_bp = Blueprint('team', __name__)
team_service = TeamService(get_db_connection)

@team_bp.route('/teams/<int:user_id>/pokemons', methods=['GET'])
def get_user_pokemons(user_id):
    """사용자가 소유한 포켓몬 가져오기"""
    try:
        result = team_service.get_user_pokemons(user_id)
        return jsonify({"pokemons": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_bp.route('/gacha', methods=['POST'])
def perform_gacha():
    """포켓몬 뽑기"""
    user_id = request.json.get('user_id')
    try:
        result = team_service.gacha(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@team_bp.route('/teams/<int:team_id>/add-pokemon', methods=['POST'])
def add_pokemon_to_team(team_id):
    """팀에 포켓몬 추가"""
    pokemon_id = request.json.get('pokemon_id')
    slot_number = request.json.get('slot_number')

    if not pokemon_id or slot_number is None:
        return jsonify({"error": "Pokemon ID와 Slot Number가 필요합니다."}), 400

    try:
        result = team_service.add_pokemon_to_team(team_id, pokemon_id, slot_number)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
