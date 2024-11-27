# backend/app.py
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import psycopg2
from config.database import DATABASE_CONFIG


app = Flask(__name__, static_folder='static')

# 정적 파일 서빙을 위한 라우트 추가
@app.route('/static/<path:filename>')
def serve_static(filename):
    return send_from_directory(app.static_folder, filename)

CORS(app)  # React와의 통신을 위해 CORS 설정

def get_db_connection():
    conn = psycopg2.connect(
        dbname=DATABASE_CONFIG['dbname'],
        user=DATABASE_CONFIG['user'],
        host=DATABASE_CONFIG['host'],
        port=DATABASE_CONFIG['port']
    )
    return conn

TYPE_MAPPING = {
    '노말': 'Normal',
    '불꽃': 'Fire',
    '물': 'Water',
    '전기': 'Electric',
    '풀': 'Grass',
    '얼음': 'Ice',
    '격투': 'Fighting',
    '독': 'Poison',
    '땅': 'Ground',
    '비행': 'Flying',
    '에스퍼': 'Psychic',
    '벌레': 'Bug',
    '바위': 'Rock',
    '고스트': 'Ghost',
    '드래곤': 'Dragon',
    '악': 'Dark',
    '강철': 'Steel',
    '페어리': 'Fairy'
}

@app.route('/api/pokemons')
def get_pokemons():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        page = request.args.get('page', 1, type=int)
        sort_by = request.args.get('sort_by', 'pokedex_number')
        sort_order = request.args.get('sort_order', 'asc')
        types = request.args.getlist('types[]')
        per_page = 20
        
        # 기본 쿼리 구성
        base_query = """
            SELECT id, pokedex_number, name, type1, type2, total, hp, attack, defense, 
                   sp_attack, sp_defense, speed, image_path
            FROM Pokemon p
            WHERE 1=1
        """
        
        params = []
        
        # 타입 필터 조건 추가 - 선택된 타입이 있을 때만 필터링
        if types:
            type_conditions = []
            for type_name in types:
                eng_type = TYPE_MAPPING.get(type_name, type_name)
                type_conditions.append("(type1 = %s OR type2 = %s)")
                params.extend([eng_type, eng_type])
            base_query += " AND (" + " OR ".join(type_conditions) + ")"
        
        # 정렬 조건 추가
        valid_sorts = {
            'total': 'total',
            'hp': 'hp',
            'attack': 'attack',
            'defense': 'defense',
            'sp_attack': 'sp_attack',
            'sp_defense': 'sp_defense',
            'speed': 'speed',
            'pokedex_number': 'pokedex_number'
        }
        
        sort_column = valid_sorts.get(sort_by, 'pokedex_number')
        sort_direction = 'ASC' if sort_order.lower() == 'asc' else 'DESC'
        
        # 정렬된 전체 데이터에서 페이지네이션 적용
        query = f"""
            WITH sorted_pokemon AS (
                {base_query}
                ORDER BY {sort_column} {sort_direction}
            )
            SELECT *
            FROM sorted_pokemon
            LIMIT %s OFFSET %s
        """
        
        params.extend([per_page, (page - 1) * per_page])
        
        cur.execute(query, params)
        pokemons = cur.fetchall()
        
        # 전체 개수 조회
        count_query = "SELECT COUNT(*) FROM Pokemon WHERE 1=1"
        count_params = []
        
        if types:
            type_conditions = []
            for type_name in types:
                eng_type = TYPE_MAPPING.get(type_name, type_name)
                type_conditions.append("(type1 = %s OR type2 = %s)")
                count_params.extend([eng_type, eng_type])
            count_query += " AND (" + " OR ".join(type_conditions) + ")"
        
        cur.execute(count_query, count_params)
        total_count = cur.fetchone()[0]
        
        has_more = ((page - 1) * per_page + len(pokemons)) < total_count
        
        # 응답에 한글 타입 매핑 추가
        reverse_type_mapping = {v: k for k, v in TYPE_MAPPING.items()}
        
        return jsonify({
            'pokemons': [
                {
                    'id': p[0],
                    'pokedex_number': p[1],
                    'name': p[2],
                    'type1': reverse_type_mapping.get(p[3], p[3]),
                    'type2': reverse_type_mapping.get(p[4], p[4]) if p[4] else None,
                    'total': p[5],
                    'hp': p[6],
                    'attack': p[7],
                    'defense': p[8],
                    'sp_attack': p[9],
                    'sp_defense': p[10],
                    'speed': p[11],
                    'image_path': f'/static/images/{p[0]}.png'
                } for p in pokemons
            ],
            'has_more': has_more,
            'total_count': total_count
        })
        
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({'error': str(e)}), 500
        
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

@app.route('/api/pokemon/<int:id>')
def pokemon_detail(id):
    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("""
        SELECT id, pokedex_number, name, type1, type2, total, hp, attack, defense, 
               sp_attack, sp_defense, speed, image_path
        FROM Pokemon
        WHERE id = %s
    """, (id,))
    pokemon = cur.fetchone()
    
    cur.execute("""
        SELECT 
            (SELECT MAX(id) FROM Pokemon WHERE id < %s) as prev_id,
            (SELECT MIN(id) FROM Pokemon WHERE id > %s) as next_id
    """, (id, id))
    nav = cur.fetchone()
    
    cur.close()
    conn.close()
    
    if pokemon is None:
        return jsonify({'error': 'Pokemon not found'}), 404
        
    return jsonify({
        'pokemon': {
            'id': pokemon[0],
            'pokedex_number': pokemon[1],
            'name': pokemon[2],
            'type1': pokemon[3],
            'type2': pokemon[4],
            'total': pokemon[5],
            'hp': pokemon[6],
            'attack': pokemon[7],
            'defense': pokemon[8],
            'sp_attack': pokemon[9],
            'sp_defense': pokemon[10],
            'speed': pokemon[11],
            'image_path': f'/images/{pokemon[0]}.png'
        },
        'navigation': {
            'prev_id': nav[0],
            'next_id': nav[1]
        }
    })

if __name__ == '__main__':
    app.run(debug=True)