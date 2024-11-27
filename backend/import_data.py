import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from config.database import DATABASE_CONFIG
import os

def create_pokemon_table(cur):
    """포켓몬 테이블 생성"""
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Pokemon (
            id SERIAL PRIMARY KEY,          -- 자동 증가하는 고유 ID
            pokedex_number INTEGER,         -- 원본 포켓몬 도감 번호
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
            port=DATABASE_CONFIG['port']
        )
        
        cur = conn.cursor()
        
        # 테이블이 존재하는지 확인 후 삭제
        cur.execute("DROP TABLE IF EXISTS Pokemon CASCADE;")
        
        # 테이블 생성
        create_pokemon_table(cur)
        
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