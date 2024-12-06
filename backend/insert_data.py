import random
from psycopg2.extras import execute_values
import psycopg2
from config.database import DATABASE_CONFIG

def insert_sample_data():
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        cur = conn.cursor()

        # 실제 존재하는 pokemon id 범위 확인
        cur.execute("SELECT MIN(id), MAX(id) FROM Pokemon")
        min_id, max_id = cur.fetchone()

        # 트리거 임시 비활성화
        cur.execute("ALTER TABLE UserPokemon DISABLE TRIGGER gacha_cooldown_check;")

        # Users 테이블 데이터 생성 (200명)
        users_data = [(f"trainer_{i}", f"trainer_{i}@ajou.ac.kr", "hashed_password_here") 
                     for i in range(1, 201)]
        # 기존 데이터 삭제
        cur.execute("TRUNCATE Users CASCADE;")  
        
        user_ids = []
        for user_data in users_data:
            cur.execute("""
                INSERT INTO Users (username, email, password)
                VALUES (%s, %s, %s) RETURNING user_id;
            """, user_data)
            user_ids.append(cur.fetchone()[0])
        conn.commit()
        print(f"Users 생성 완료: {len(user_ids)}개")
        

        # Team 테이블 데이터 생성
        team_ids = []
        for user_id in user_ids:
            cur.execute("""
                INSERT INTO Team (user_id, team_name)
                VALUES (%s, %s) RETURNING team_id;
            """, (user_id, f"Team_{user_id}"))
            team_ids.append(cur.fetchone()[0])
        conn.commit()
        print(f"Teams 생성 완료: {len(team_ids)}개")

        # UserPokemon 테이블 데이터 생성
        for user_id in user_ids:
            pokemon_ids = random.sample(range(min_id, max_id + 1), 10)
            user_pokemon_data = [(user_id, pokemon_id) for pokemon_id in pokemon_ids]
            execute_values(cur, """
                INSERT INTO UserPokemon (user_id, pokemon_id)
                VALUES %s;
            """, user_pokemon_data)
        conn.commit()
        print("UserPokemon 생성 완료")

        # TeamPokemon 테이블 데이터 생성
        for team_id in team_ids:
            pokemon_ids = random.sample(range(min_id, max_id + 1), 6)
            team_pokemon_data = [(team_id, pokemon_id, slot) 
                               for slot, pokemon_id in enumerate(pokemon_ids, 1)]
            execute_values(cur, """
                INSERT INTO TeamPokemon (team_id, pokemon_id, slot_number)
                VALUES %s;
            """, team_pokemon_data)
        conn.commit()
        print("TeamPokemon 생성 완료")

        # 트리거 다시 활성화
        cur.execute("ALTER TABLE UserPokemon ENABLE TRIGGER gacha_cooldown_check;")
        conn.commit()
        print("모든 샘플 데이터 삽입 완료!")
        
    except Exception as e:
        print(f"에러 발생: {e}")
        conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    insert_sample_data()