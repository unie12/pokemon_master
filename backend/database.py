import psycopg2
from configparser import ConfigParser
from psycopg2.extras import RealDictCursor

def get_db_connection():
    conn = psycopg2.connect(
        host="localhost",
        database="pokemon_master",
        user="your_username",
        password="your_password"
    )
    return conn

def config(filename='config/database.ini', section='postgresql'):
    parser = ConfigParser()
    parser.read(filename)
    db = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            db[param[0]] = param[1]
    else:
        raise Exception(f'Section {section} not found in the {filename} file')
    return db