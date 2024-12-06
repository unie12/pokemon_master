class Team:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection

    def create_team(self, user_id, team_name):
        """유저가 팀을 생성"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                # 팀 이름이 중복되지 않는지 확인
                cur.execute("""
                    SELECT 1 FROM Team WHERE user_id = %s AND name = %s
                """, (user_id, team_name))
                if cur.fetchone():
                    return {"error": "이미 같은 이름의 팀이 존재합니다."}

                # 팀 생성
                cur.execute("""
                    INSERT INTO Team (user_id, name, created_at)
                    VALUES (%s, %s, NOW()) RETURNING id
                """, (user_id, team_name))
                team_id = cur.fetchone()[0]
                conn.commit()
                return {"team_id": team_id, "message": f"팀 '{team_name}'이(가) 성공적으로 생성되었습니다."}

    def add_pokemon_to_team(self, team_id, pokemon_id, position):
        """팀에 포켓몬을 추가 (최대 6개)"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                # 팀에 포켓몬 추가하기 전에 팀의 포켓몬 수 확인
                cur.execute("""
                    SELECT COUNT(*) FROM TeamPokemon WHERE team_id = %s
                """, (team_id,))
                team_size = cur.fetchone()[0]
                if team_size >= 6:
                    return {"error": "팀에 더 이상 포켓몬을 추가할 수 없습니다. (최대 6개)"}

                # 포켓몬 추가
                cur.execute("""
                    INSERT INTO TeamPokemon (team_id, pokemon_id, number)
                    VALUES (%s, %s, %s)
                """, (team_id, pokemon_id, position))
                conn.commit()

                return {"message": "포켓몬이 팀에 성공적으로 추가되었습니다."}

    def get_team_pokemons(self, team_id):
        """팀에 속한 포켓몬 가져오기"""
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT p.id, p.name, p.type1, p.type2, p.total, tp.number
                    FROM TeamPokemon tp
                    JOIN Pokemon p ON tp.pokemon_id = p.id
                    WHERE tp.team_id = %s
                """, (team_id,))
                return cur.fetchall()
