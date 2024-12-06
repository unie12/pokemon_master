class TeamService:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection
        self.type_mapping = {
            'Normal': '노말', 'Fire': '불꽃', 'Water': '물',
            'Electric': '전기', 'Grass': '풀', 'Ice': '얼음',
            'Fighting': '격투', 'Poison': '독', 'Ground': '땅',
            'Flying': '비행', 'Psychic': '에스퍼', 'Bug': '벌레',
            'Rock': '바위', 'Ghost': '고스트', 'Dragon': '드래곤',
            'Dark': '악', 'Steel': '강철', 'Fairy': '페어리'
        }
        self.all_types = list(self.type_mapping.keys())

    # def get_team_type_analysis(self, team_id):
    #     with self.get_db_connection() as conn:
    #         with conn.cursor() as cur:
    #             cur.execute("""
    #                 WITH team_types AS (
    #                     SELECT 
    #                         ARRAY_AGG(DISTINCT p.type1) FILTER (WHERE p.type1 IS NOT NULL) as type1_array,
    #                         ARRAY_AGG(DISTINCT p.type2) FILTER (WHERE p.type2 IS NOT NULL) as type2_array
    #                     FROM Team t
    #                     JOIN TeamPokemon tp ON t.team_id = tp.team_id
    #                     JOIN Pokemon p ON tp.pokemon_id = p.id
    #                     WHERE t.team_id = %s
    #                 )
    #                 SELECT 
    #                     type1_array,
    #                     type2_array,
    #                     ARRAY(
    #                         SELECT t.type_name
    #                         FROM unnest(%s::text[]) AS t(type_name)
    #                         WHERE t.type_name NOT IN (
    #                             SELECT unnest(type1_array || type2_array)
    #                             FROM team_types
    #                         )
    #                     ) as missing_types
    #                 FROM team_types
    #             """, (team_id, self.all_types))
                
    #             result = cur.fetchone()
    #             if not result:
    #                 return None

    #             present_types = list(set(result[0] or [] + result[1] or []))
    #             missing_types = result[2] or []

    #             # 타입을 한글로 변환
    #             present_types = [self.type_mapping[t] for t in present_types]
    #             missing_types = [self.type_mapping[t] for t in missing_types]

    #             return {
    #                 'success': True,
    #                 'type_analysis': {
    #                     'present_types': present_types,
    #                     'missing_types': missing_types
    #                 }
    #             }

    def gacha(self, user_id):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute("""
                        SELECT id, name, type1, type2, total
                        FROM Pokemon 
                        ORDER BY RANDOM() LIMIT 1
                    """)
                    pokemon = cur.fetchone()

                    if not pokemon:
                        raise Exception("No Pokémon found")

                    pokemon_id, name, type1, type2, total = pokemon

                    # 이미 보유한 포켓몬인지 확인
                    cur.execute("""
                        SELECT 1 FROM UserPokemon 
                        WHERE user_id = %s AND pokemon_id = %s
                    """, (user_id, pokemon_id))

                    if cur.fetchone():
                        raise Exception("You already own this Pokémon!")

                    # UserPokemon에 포켓몬 추가
                    cur.execute("""
                        INSERT INTO UserPokemon (user_id, pokemon_id) 
                        VALUES (%s, %s)
                    """, (user_id, pokemon_id))
                    conn.commit()

                    return {
                        "pokemon_id": pokemon_id,
                        "name": name,
                        "type1": type1,
                        "type2": type2,
                        "total": total,
                        "image_path": f'/static/images/{pokemon_id}.png',
                        "message": f"Successfully caught {name}!"
                    }
                except Exception as e:
                    conn.rollback()
                    raise e
            
    def get_user_pokemons(self, user_id):
        """사용자가 소유한 모든 포켓몬 조회"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT p.id, p.name, p.type1, p.type2, 
                        p.total, p.hp, p.attack, p.defense,
                        p.sp_attack, p.sp_defense, p.speed,
                        p.pokedex_number
                    FROM UserPokemon up 
                    JOIN Pokemon p ON up.pokemon_id = p.id 
                    WHERE up.user_id = %s
                    ORDER BY p.id
                """, (user_id,))
                
                pokemons = cur.fetchall()
                return [{
                    'id': pokemon[0],
                    'name': pokemon[1],
                    'type1': pokemon[2],
                    'type2': pokemon[3],
                    'total': pokemon[4],
                    'hp': pokemon[5],
                    'attack': pokemon[6],
                    'defense': pokemon[7],
                    'sp_attack': pokemon[8],
                    'sp_defense': pokemon[9],
                    'speed': pokemon[10],
                    'pokedex_number': pokemon[11],
                    'image_path': f'/static/images/{pokemon[0]}.png'
                } for pokemon in pokemons]
            
    def get_user_team(self, user_id):
        """사용자의 팀 조회 (단일 팀)"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT team_id, team_name, created_date 
                    FROM Team 
                    WHERE user_id = %s
                    LIMIT 1
                """, (user_id,))
                team = cur.fetchone()
                if not team:
                    return None
                return {
                    'id': team[0],
                    'name': team[1],
                    'created_date': team[2].strftime('%Y-%m-%d %H:%M:%S') if team[2] else None
                }

    def create_team(self, user_id, team_name):
        """팀 생성 (기존 팀이 있으면 업데이트)"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    # 기존 팀 확인
                    cur.execute("""
                        SELECT team_id FROM Team WHERE user_id = %s
                    """, (user_id,))
                    existing_team = cur.fetchone()
                    
                    if existing_team:
                        # 기존 팀 이름 업데이트
                        cur.execute("""
                            UPDATE Team 
                            SET team_name = %s 
                            WHERE team_id = %s 
                            RETURNING team_id, team_name, created_date
                        """, (team_name, existing_team[0]))
                    else:
                        # 새 팀 생성
                        cur.execute("""
                            INSERT INTO Team (user_id, team_name)
                            VALUES (%s, %s)
                            RETURNING team_id, team_name, created_date
                        """, (user_id, team_name))
                    
                    team = cur.fetchone()
                    conn.commit()
                    
                    return {
                        'success': True,
                        'team': {
                            'id': team[0],
                            'name': team[1],
                            'created_date': team[2].isoformat() if team[2] else None
                        },
                        'message': 'Team updated successfully' if existing_team else 'Team created successfully'
                    }
                except Exception as e:
                    conn.rollback()
                    raise e
                
    def get_team_pokemons(self, team_id):
        """특정 팀의 포켓몬 조회"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute("""
                        SELECT tp.pokemon_id, p.name, p.type1, p.type2, tp.slot_number
                        FROM TeamPokemon tp
                        JOIN Pokemon p ON tp.pokemon_id = p.id
                        WHERE tp.team_id = %s
                        ORDER BY tp.slot_number
                    """, (team_id,))
                    
                    pokemons = cur.fetchall()
                    slots = [None] * 6
                    
                    for pokemon in pokemons:
                        slots[pokemon[4] - 1] = {
                            'id': pokemon[0],
                            'name': pokemon[1],
                            'type1': pokemon[2],
                            'type2': pokemon[3],
                            'image_path': f'/static/images/{pokemon[0]}.png'
                        }
                    
                    return {
                        'success': True,
                        'slots': slots
                    }
                except Exception as e:
                    print(f"Error fetching team pokemons: {str(e)}")
                    return {
                        'success': False,
                        'error': str(e)
                    }
            
    def remove_pokemon_from_team(self, team_id, slot_number):
        """팀에서 포켓몬 제거"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    cur.execute("""
                        DELETE FROM TeamPokemon
                        WHERE team_id = %s AND slot_number = %s
                        RETURNING pokemon_id
                    """, (team_id, slot_number))
                    
                    result = cur.fetchone()
                    if not result:
                        raise Exception("Pokemon not found in the specified slot")
                    
                    conn.commit()
                    return {
                        'success': True,
                        'message': 'Pokemon removed from team successfully'
                    }
                except Exception as e:
                    conn.rollback()
                    raise e
                
    def add_pokemon_to_team(self, team_id, pokemon_id, slot_number):
        """팀에 포켓몬 추가"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                try:
                    # 슬롯 유효성 검사
                    if slot_number < 1 or slot_number > 6:
                        return {
                            "success": False,
                            "error": "Invalid slot number"
                        }

                    # 포켓몬 소유 여부 확인
                    cur.execute("""
                        SELECT user_id FROM Team WHERE team_id = %s
                    """, (team_id,))
                    team = cur.fetchone()
                    
                    cur.execute("""
                        SELECT 1 FROM UserPokemon 
                        WHERE user_id = %s AND pokemon_id = %s
                    """, (team[0], pokemon_id))
                    
                    if not cur.fetchone():
                        return {
                            "success": False,
                            "error": "You don't own this pokemon"
                        }

                    # 슬롯에 포켓몬 추가/업데이트
                    cur.execute("""
                        INSERT INTO TeamPokemon (team_id, pokemon_id, slot_number)
                        VALUES (%s, %s, %s)
                        ON CONFLICT (team_id, slot_number) 
                        DO UPDATE SET pokemon_id = EXCLUDED.pokemon_id
                        RETURNING *
                    """, (team_id, pokemon_id, slot_number))
                    
                    conn.commit()
                    return {
                        "success": True,
                        "message": "Pokemon added to team successfully"
                    }
                except Exception as e:
                    conn.rollback()
                    raise e
                
    # TeamService에 새로운 메서드 추가
    def get_team_statistics(self, team_id):
        """팀 통계 정보 조회 (View 사용)"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT * FROM team_statistics 
                    WHERE team_id = %s
                """, (team_id,))
                stats = cur.fetchone()
                if not stats:
                    return None
                    
                # stats 객체를 중첩하지 않고 직접 반환
                return {
                    'success': True,
                    'team_id': stats[0],
                    'team_name': stats[1],
                    'username': stats[2],
                    'total_stats': stats[4],
                    'total_hp': stats[5],
                    'total_attack': stats[6],
                    'total_defense': stats[7],
                    'total_sp_attack': stats[8],
                    'total_sp_defense': stats[9],
                    'total_speed': stats[10],
                    'pokemon_count': stats[11]
                }
                
    def get_team_type_analysis(self, team_id):
        """팀의 타입별 분석 (View 사용)"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                # team_type_analysis View 사용
                cur.execute("""
                    SELECT team_name, type1, pokemon_count, avg_total, total_power
                    FROM team_type_analysis
                    WHERE team_name = (
                        SELECT team_name FROM Team WHERE team_id = %s
                    )
                """, (team_id,))
                
                type_stats = cur.fetchall()
                if not type_stats:
                    return {
                        'success': False,
                        'error': 'Team not found'
                    }

                # 보유 타입과 미보유 타입 구분
                present_types = [row[1] for row in type_stats if row[1] != 'All Types']
                missing_types = [t for t in self.all_types if t not in present_types]

                return {
                    'success': True,
                    'type_analysis': {
                        'present_types': present_types,
                        'missing_types': missing_types,
                        'stats': {
                            'pokemon_count': type_stats[0][2],
                            'avg_total': type_stats[0][3],
                            'total_power': type_stats[0][4]
                        }
                    }
                }