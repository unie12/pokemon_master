import psycopg2
from contextlib import contextmanager

DATABASE_CONFIG = {
    'dbname': 'pokemon',
    'user': 'postgres',
    'host': 'localhost',
    'port': '5432'
}

@contextmanager
def get_db_connection():
    conn = None
    try:
        conn = psycopg2.connect(**DATABASE_CONFIG)
        yield conn
    finally:
        if conn is not None:
            conn.close()