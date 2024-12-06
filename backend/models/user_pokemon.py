class TeamPokemon:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection

    def gacha(self, user_id, team_id):
        """랜덤 포켓몬을 뽑고 UserPokemon과 TeamPokemon에 추가"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                # 랜덤 포켓몬 선택
                cur.execute(""" 
                    SELECT id, name, type1, type2, total, image_path 
                    FROM Pokemon 
                    ORDER BY RANDOM() LIMIT 1
                """)
                pokemon = cur.fetchone()
                if not pokemon:
                    return {"error": "포켓몬을 찾을 수 없습니다."}
                pokemon_id, name, type1, type2, total, image_path = pokemon

                # 이미 보유한 포켓몬인지 확인
                cur.execute(""" 
                    SELECT 1 FROM UserPokemon 
                    WHERE user_id = %s AND pokemon_id = %s
                """, (user_id, pokemon_id))
                if cur.fetchone():
                    return {"error": "이미 보유한 포켓몬입니다!"}

                # UserPokemon에 포켓몬 추가
                cur.execute("""
                    INSERT INTO UserPokemon (user_id, pokemon_id) 
                    VALUES (%s, %s)
                """, (user_id, pokemon_id))

                # 팀에 포켓몬 추가 (최대 6개 제한)
                cur.execute("""
                    SELECT COUNT(*) FROM TeamPokemon WHERE team_id = %s
                """, (team_id,))
                team_size = cur.fetchone()[0]
                if team_size >= 6:
                    return {"error": "팀에 더 이상 포켓몬을 추가할 수 없습니다. (최대 6개)"}

                # 팀에 포켓몬 추가
                position = team_size + 1  # 포켓몬 위치 설정
                cur.execute("""
                    INSERT INTO TeamPokemon (team_id, pokemon_id, number) 
                    VALUES (%s, %s, %s)
                """, (team_id, pokemon_id, position))
                conn.commit()

                # 추가된 포켓몬 정보 반환
                return {
                    "pokemon_id": pokemon_id,
                    "name": name,
                    "type1": type1,
                    "type2": type2,
                    "total": total,
                    "image_path": image_path,
                    "message": f"{name}을(를) 성공적으로 획득하고 팀에 추가했습니다!"
                }
