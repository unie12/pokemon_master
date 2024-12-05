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
        
        # 데이터 일괄 삽입을 위한 준비
        data = [
            (
                int(row['id']),             # 이미지 번호 기반 ID
                int(row['Index']),          # 원본 도감 번호
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
        
        # execute_values를 사용한 대량 삽입
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