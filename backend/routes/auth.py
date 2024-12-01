from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from config.database import get_db_connection
import re

auth_bp = Blueprint('auth', __name__)
auth_service = AuthService(get_db_connection)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 8

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')

    # 입력값 검증
    if not all([email, password, username]):
        return jsonify({'error': '모든 필드를 입력해주세요.'}), 400
    
    if not validate_email(email):
        return jsonify({'error': '유효하지 않은 이메일 형식입니다.'}), 400
    
    if not validate_password(password):
        return jsonify({'error': '비밀번호는 8자 이상이어야 합니다.'}), 400

    try:
        user = auth_service.register(username, email, password)
        return jsonify({
            'message': '회원가입이 완료되었습니다.',
            'user': user.to_dict()
        }), 201
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'error': '이메일과 비밀번호를 입력해주세요.'}), 400

    try:
        user = auth_service.login(email, password)
        return jsonify({
            'message': '로그인 성공',
            'user': user.to_dict()
        })
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': '서버 오류가 발생했습니다.'}), 500
    
@auth_bp.route('/logout', methods=['POST'])
def logout():
    try:
        return jsonify({
            'message': '로그아웃 되었습니다.'
        }), 200
    except Exception as e:
        return jsonify({'error': '로그아웃 처리 중 오류가 발생했습니다.'}), 500