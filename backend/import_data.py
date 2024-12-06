import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from config.database import DATABASE_CONFIG
import os

def create_tables(cur):
    """테이블 생성"""
    # 포켓몬 테이블 생성
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Pokemon (
            id SERIAL PRIMARY KEY,        
            pokedex_number INTEGER,       
            name VARCHAR(50) NOT NULL,
            type1 VARCHAR(20) NOT NULL,
            type2 VARCHAR(20),
            total INTEGER,
            hp INTEGER,
            attack INTEGER,
            defense INTEGER,
            sp_attack INTEGER,
            sp_defense INTEGER,
            speed INTEGER,
            image_path VARCHAR(255)
        );
    """)

    # 사용자 테이블 생성
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Users (
            user_id SERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            last_gacha_time TIMESTAMP,
            join_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 팀 테이블 생성
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Team (
            team_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(user_id),
            team_name VARCHAR(50) NOT NULL,
            created_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    """)

    # 팀 포켓몬 테이블 생성
    cur.execute("""
        CREATE TABLE IF NOT EXISTS TeamPokemon (
            team_id INTEGER REFERENCES Team(team_id),
            pokemon_id INTEGER REFERENCES Pokemon(id),
            slot_number INTEGER CHECK (slot_number BETWEEN 1 AND 6),
            PRIMARY KEY (team_id, slot_number)
        );
    """)

    # UserPokemon 테이블 생성
    cur.execute("""
        CREATE TABLE IF NOT EXISTS UserPokemon (
            user_pokemon_id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES Users(user_id),
            pokemon_id INTEGER REFERENCES Pokemon(id),
            obtained_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, pokemon_id)
        );
    """)

    # team stat view 생성
    cur.execute("""
        CREATE OR REPLACE VIEW team_statistics AS
        SELECT 
            t.team_id,
            t.team_name,
            u.username,
            u.user_id,
            COALESCE(SUM(p.total), 0) as total_stats,
            COALESCE(SUM(p.hp), 0) as total_hp,
            COALESCE(SUM(p.attack), 0) as total_attack,
            COALESCE(SUM(p.defense), 0) as total_defense,
            COALESCE(SUM(p.sp_attack), 0) as total_sp_attack,
            COALESCE(SUM(p.sp_defense), 0) as total_sp_defense,
            COALESCE(SUM(p.speed), 0) as total_speed,
            COUNT(tp.pokemon_id) as pokemon_count
        FROM Team t
        JOIN Users u ON t.user_id = u.user_id
        LEFT JOIN TeamPokemon tp ON t.team_id = tp.team_id
        LEFT JOIN Pokemon p ON tp.pokemon_id = p.id
        GROUP BY t.team_id, t.team_name, u.username, u.user_id;
    """)

    # Trigger 생성
    cur.execute("""
        CREATE OR REPLACE FUNCTION check_gacha_cooldown()
        RETURNS TRIGGER AS $$
        DECLARE
            last_time TIMESTAMP;
            time_diff INTERVAL;
            remaining_time INTERVAL;
        BEGIN
            SELECT last_gacha_time INTO last_time
            FROM Users 
            WHERE user_id = NEW.user_id;
            
            IF last_time IS NOT NULL THEN
                time_diff := NOW() - last_time;
                IF time_diff < INTERVAL '24 hours' THEN
                    remaining_time := INTERVAL '24 hours' - time_diff;
                    RAISE EXCEPTION 'COOLDOWN:%', 
                        jsonb_build_object(
                            'hours', EXTRACT(HOUR FROM remaining_time)::INTEGER,
                            'minutes', EXTRACT(MINUTE FROM remaining_time)::INTEGER,
                            'seconds', FLOOR(EXTRACT(SECOND FROM remaining_time))::INTEGER
                        )::text;
                END IF;
            END IF;
            
            UPDATE Users 
            SET last_gacha_time = CURRENT_TIMESTAMP 
            WHERE user_id = NEW.user_id;
            
            RETURN NEW;
        END;
        $$
        LANGUAGE plpgsql;
    """)

    # Trigger 생성
    cur.execute("""
        DROP TRIGGER IF EXISTS gacha_cooldown_check ON UserPokemon;
        CREATE TRIGGER gacha_cooldown_check
        BEFORE INSERT ON UserPokemon
        FOR EACH ROW
        EXECUTE FUNCTION check_gacha_cooldown();
    """)

    # view rollup 생성
    cur.execute("""
        CREATE OR REPLACE VIEW team_type_analysis AS
        SELECT 
            COALESCE(t.team_name, 'Total') as team_name,
            COALESCE(p.type1, 'All Types') as type1,
            COUNT(*) as pokemon_count,
            AVG(p.total) as avg_total,
            SUM(p.total) as total_power
        FROM Team t
        JOIN TeamPokemon tp ON t.team_id = tp.team_id
        JOIN Pokemon p ON tp.pokemon_id = p.id
        GROUP BY ROLLUP(t.team_name, p.type1)
        ORDER BY team_name NULLS LAST, type1 NULLS LAST;
    """)



    
def import_pokemon_data():
    try:
        # CSV 파일 읽기
        df = pd.read_csv('pokedex.csv')
        
        # 이미지 경로에서 숫자만 추출하여 새로운 id 컬럼 생성
        df['id'] = df['Image'].str.extract(r'images/(\d+)\.png').astype(int)
        
        # 데이터베이스 연결
        conn = psycopg2.connect(
            dbname=DATABASE_CONFIG['dbname'],
            user=DATABASE_CONFIG['user'],
            host=DATABASE_CONFIG['host'],
            # password=DATABASE_CONFIG['password'],
            port=DATABASE_CONFIG['port']
        )
        
        cur = conn.cursor()
        
        # 테이블이 존재하는지 확인 후 삭제
        cur.execute("DROP TABLE IF EXISTS Pokemon CASCADE;")
        
        # 테이블 생성
        create_tables(cur)
        
        # 포켓몬 데이터 테이블에 삽입
        data = [
            (
                int(row['id']),            
                int(row['Index']),      
                row['Name'],
                row['Type 1'],
                row['Type 2'] if pd.notna(row['Type 2']) else None,
                int(row['Total']),
                int(row['HP']),
                int(row['Attack']),
                int(row['Defense']),
                int(row['SP. Atk.']),
                int(row['SP. Def']),
                int(row['Speed']),
                row['Image']
            )
            for _, row in df.iterrows()
        ]
        
        execute_values(cur, """
            INSERT INTO Pokemon (
                id, pokedex_number, name, type1, type2, total,
                hp, attack, defense, sp_attack, sp_defense, speed, image_path
            ) VALUES %s;
        """, data)
        
        conn.commit()
        print("포켓몬 데이터 가져오기 완료!")
        
    except Exception as e:
        print(f"에러 발생: {e}")
        conn.rollback()
        
    finally:
        if 'cur' in locals() and cur is not None:
            cur.close()
        if 'conn' in locals() and conn is not None:
            conn.close()

if __name__ == "__main__":
    import_pokemon_data()