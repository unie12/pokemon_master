class RankingService:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection

    def get_team_rankings(self, page, per_page):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                offset = (page - 1) * per_page
                
                cur.execute("""
                    WITH team_stats AS (
                        SELECT 
                            t.team_id,
                            t.team_name,
                            u.username,
                            u.user_id, 
                            SUM(p.total) as total_stats,
                            COUNT(tp.pokemon_id) as pokemon_count,
                            array_agg(p.id) as pokemon_ids,
                            array_agg(p.image_path) as pokemon_images
                        FROM Team t
                        JOIN Users u ON t.user_id = u.user_id
                        JOIN TeamPokemon tp ON t.team_id = tp.team_id
                        JOIN Pokemon p ON tp.pokemon_id = p.id
                        GROUP BY t.team_id, t.team_name, u.username, u.user_id
                    )
                    SELECT *, COUNT(*) OVER() as total_count
                    FROM team_stats
                    ORDER BY total_stats DESC
                    LIMIT %s OFFSET %s
                """, (per_page, offset))
                
                rankings = cur.fetchall()
                
                if not rankings:
                    return {'rankings': [], 'total_count': 0}

                total_count = rankings[0][-1]
                
        return {
            'rankings': [
                {
                    'rank': offset + idx + 1,
                    'team_id': r[0],
                    'team_name': r[1],
                    'username': r[2],
                    'user_id': r[3],     
                    'total_stats': r[4],
                    'pokemon_count': r[5],
                    'pokemon_ids': r[6],
                    'pokemon_images': r[7]
                }
                for idx, r in enumerate(rankings)
            ],
            'total_count': total_count
        }

    def compare_team_stats(self, user_id):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        t.team_id,
                        t.team_name,
                        u.username,
                        u.user_id,
                        SUM(p.hp) as total_hp,
                        SUM(p.attack) as total_attack,
                        SUM(p.defense) as total_defense,
                        SUM(p.sp_attack) as total_sp_attack,
                        SUM(p.sp_defense) as total_sp_defense,
                        SUM(p.speed) as total_speed,
                        SUM(p.total) as total_stats,
                        array_agg(json_build_object(
                            'id', p.id,
                            'name', p.name,
                            'type1', p.type1,
                            'type2', p.type2,
                            'slot', tp.slot_number
                        ) ORDER BY tp.slot_number) as pokemons
                    FROM Team t
                    JOIN Users u ON t.user_id = u.user_id
                    JOIN TeamPokemon tp ON t.team_id = tp.team_id
                    JOIN Pokemon p ON tp.pokemon_id = p.id
                    WHERE u.user_id = %s  -- team_id 대신 user_id로 검색
                    GROUP BY t.team_id, t.team_name, u.username, u.user_id
                """, (user_id,))
                
                result = cur.fetchone()
                if not result:
                    return None
                    
                return {
                    'team_id': result[0],
                    'team_name': result[1],
                    'username': result[2],
                    'user_id': result[3],
                    'total_hp': result[4],
                    'total_attack': result[5],
                    'total_defense': result[6],
                    'total_sp_attack': result[7],
                    'total_sp_defense': result[8],
                    'total_speed': result[9],
                    'total_stats': result[10],
                    'pokemons': result[11]
                }