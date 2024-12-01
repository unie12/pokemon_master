from utils.type_mapping import TYPE_MAPPING

class PokemonService:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection

    def get_pokemons(self, page, sort_by, sort_order, types):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                per_page = 20
                
                base_query = """
                    SELECT id, pokedex_number, name, type1, type2, total, hp, attack, defense, 
                           sp_attack, sp_defense, speed, image_path
                    FROM Pokemon p
                    WHERE 1=1
                """
                
                params = []
                
                if types:
                    type_conditions = []
                    for type_name in types:
                        eng_type = TYPE_MAPPING.get(type_name, type_name)
                        type_conditions.append("(type1 = %s OR type2 = %s)")
                        params.extend([eng_type, eng_type])
                    base_query += " AND (" + " OR ".join(type_conditions) + ")"
                
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
                
                reverse_type_mapping = {v: k for k, v in TYPE_MAPPING.items()}
                
                return {
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
                }

    def get_pokemon_detail(self, id):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT id, pokedex_number, name, type1, type2, total, hp, attack, defense, 
                           sp_attack, sp_defense, speed, image_path
                    FROM Pokemon
                    WHERE id = %s
                """, (id,))
                pokemon = cur.fetchone()
                
                if pokemon is None:
                    raise Exception('Pokemon not found')
                
                cur.execute("""
                    SELECT 
                        (SELECT MAX(id) FROM Pokemon WHERE id < %s) as prev_id,
                        (SELECT MIN(id) FROM Pokemon WHERE id > %s) as next_id
                """, (id, id))
                nav = cur.fetchone()
                
                return {
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
                }