class TeamService:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection
        self.all_types = [
            'Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice',
            'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic',
            'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'
        ]

    def get_team_type_analysis(self, team_id):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    WITH team_types AS (
                        SELECT 
                            ARRAY_AGG(DISTINCT p.type1) FILTER (WHERE p.type1 IS NOT NULL) as type1_array,
                            ARRAY_AGG(DISTINCT p.type2) FILTER (WHERE p.type2 IS NOT NULL) as type2_array
                        FROM Team t
                        JOIN TeamPokemon tp ON t.team_id = tp.team_id
                        JOIN Pokemon p ON tp.pokemon_id = p.id
                        WHERE t.team_id = %s
                    )
                    SELECT 
                        type1_array,
                        type2_array,
                        ARRAY(
                            SELECT t.type_name
                            FROM unnest(%s::text[]) AS t(type_name)
                            WHERE t.type_name NOT IN (
                                SELECT unnest(type1_array || type2_array)
                                FROM team_types
                            )
                        ) as missing_types
                    FROM team_types
                """, (team_id, self.all_types))
                
                result = cur.fetchone()
                if not result:
                    return None

                present_types = list(set(result[0] or [] + result[1] or []))
                missing_types = result[2] or []

                return {
                    'present_types': present_types,
                    'missing_types': missing_types
                }
        
    def get_team_details(self, team_id):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        t.team_id,
                        t.team_name,
                        u.username,
                        u.user_id,
                        json_build_object(
                            'pokemon_details', (
                                SELECT json_agg(json_build_object(
                                    'id', p.id,
                                    'name', p.name,
                                    'type1', p.type1,
                                    'type2', p.type2,
                                    'slot', tp.slot_number,
                                    'stats', json_build_object(
                                        'hp', p.hp,
                                        'attack', p.attack,
                                        'defense', p.defense,
                                        'sp_attack', p.sp_attack,
                                        'sp_defense', p.sp_defense,
                                        'speed', p.speed
                                    )
                                ) ORDER BY tp.slot_number)
                                FROM TeamPokemon tp
                                JOIN Pokemon p ON tp.pokemon_id = p.id
                                WHERE tp.team_id = t.team_id
                            ),
                            'type_analysis', (
                                SELECT json_build_object(
                                    'present_types', present_types,
                                    'missing_types', missing_types
                                )
                                FROM get_team_type_analysis(%s)
                            )
                        ) as team_data
                    FROM Team t
                    JOIN Users u ON t.user_id = u.user_id
                    WHERE t.team_id = %s
                """, (team_id, team_id))
                
                return cur.fetchone()