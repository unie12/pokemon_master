from flask import Blueprint, jsonify, request
from services.team_service import TeamService
from config.database import get_db_connection

team_bp = Blueprint('team', __name__)
team_service = TeamService(get_db_connection)

@team_bp.route('/teams/<int:team_id>/type-analysis', methods=['GET'])
def get_team_type_analysis(team_id):
    try:
        analysis = team_service.get_team_type_analysis(team_id)
        if not analysis:
            return jsonify({'error': 'Team not found'}), 404
        return jsonify(analysis)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    
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
    user_id = request.json.get('user_id')
    try:
        result = team_service.gacha(user_id)
        return jsonify({
            "success": True,
            "pokemon": {
                "id": result["pokemon_id"],
                "name": result["name"],
                "type1": result["type1"],
                "type2": result["type2"],
                "total": result["total"],
                "image_path": result["image_path"]
            },
            "message": result["message"]
        })
    except Exception as e:
        error_message = str(e)
        # 쿨다운 에러 메시지 처리
        if '가챠 쿨다운:' in error_message:
            return jsonify({
                "success": False,
                "error": error_message
            }), 400  # 400 Bad Request로 변경
        return jsonify({
            "success": False,
            "error": error_message
        }), 500

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

@team_bp.route('/teams/<int:team_id>/slots', methods=['GET'])
def get_team_slots(team_id):
    """팀의 포켓몬 슬롯 정보 조회"""
    try:
        result = team_service.get_team_pokemons(team_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@team_bp.route('/teams/<int:team_id>/pokemon/<int:slot_number>', methods=['DELETE'])
def remove_pokemon_from_team(team_id, slot_number):
    """팀에서 포켓몬 제거"""
    try:
        result = team_service.remove_pokemon_from_team(team_id, slot_number)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@team_bp.route('/teams', methods=['POST'])
def create_team():
    """새로운 팀 생성"""
    data = request.json
    try:
        result = team_service.create_team(
            user_id=data.get('user_id'),
            team_name=data.get('team_name')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
            
@team_bp.route('/teams/<int:user_id>/team', methods=['GET'])
def get_user_team(user_id):
    """사용자의 단일 팀 조회"""
    try:
        result = team_service.get_user_team(user_id)
        if not result:
            return jsonify({
                "success": True,
                "team": None
            })
        return jsonify({
            "success": True,
            "team": result
        })
    except Exception as e:
        print(f"Error in get_user_team: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@team_bp.route('/teams/<int:team_id>/stats', methods=['GET'])
def get_team_stats(team_id):
    """팀 통계 정보 조회"""
    try:
        result = team_service.get_team_statistics(team_id)
        if not result:
            return jsonify({
                'success': False,
                'error': 'Team not found'
            }), 404
        return jsonify({
            'success': True,
            'stats': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500