from flask import Blueprint, jsonify, request
from services.ranking_service import RankingService
from config.database import get_db_connection

ranking_bp = Blueprint('ranking', __name__)
ranking_service = RankingService(get_db_connection)

@ranking_bp.route('/rankings', methods=['GET'])
def get_rankings():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    try:
        rankings = ranking_service.get_team_rankings(page, per_page)
        return jsonify(rankings)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@ranking_bp.route('/rankings/compare/<int:team_id>', methods=['GET'])
def compare_teams(team_id):
    try:
        comparison = ranking_service.compare_team_stats(team_id)
        return jsonify(comparison)
    except Exception as e:
        return jsonify({'error': str(e)}), 500