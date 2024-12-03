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

@team_bp.route('/teams/<int:team_id>', methods=['GET'])
def get_team_details(team_id):
    try:
        team_details = team_service.get_team_details(team_id)
        if not team_details:
            return jsonify({'error': 'Team not found'}), 404
        return jsonify(team_details)
    except Exception as e:
        return jsonify({'error': str(e)}), 500