from models.user import User
from werkzeug.security import generate_password_hash

class AuthService:
    def __init__(self, db_connection):
        self.get_db_connection = db_connection

    def validate_ajou_email(self, email):
        """아주대학교 이메일 검증"""
        if not email.endswith('@ajou.ac.kr'):
            raise ValueError("아주대학교 이메일(@ajou.ac.kr)만 사용 가능합니다.")

    def register(self, username, email, password):
        # 아주대학교 이메일 검증
        self.validate_ajou_email(email)

        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                # 이메일 중복 체크
                cur.execute("SELECT * FROM Users WHERE email = %s", (email,))
                if cur.fetchone():
                    raise ValueError("이미 존재하는 이메일입니다.")

                # 사용자 이름 중복 체크
                cur.execute("SELECT * FROM Users WHERE username = %s", (username,))
                if cur.fetchone():
                    raise ValueError("이미 존재하는 사용자 이름입니다.")

                # 새 사용자 추가
                cur.execute("""
                    INSERT INTO Users (username, email, password, join_date)
                    VALUES (%s, %s, %s, CURRENT_TIMESTAMP)
                    RETURNING user_id, username, email, password, last_gacha_time, join_date
                """, (username, email, generate_password_hash(password)))
                
                user_data = cur.fetchone()
                conn.commit()
                return User.from_db_row(user_data)

    def login(self, email, password):
        with self.get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT user_id, username, email, password, last_gacha_time, join_date
                    FROM Users WHERE email = %s
                """, (email,))
                user_data = cur.fetchone()
                
                if not user_data:
                    raise ValueError("이메일이 존재하지 않습니다.")
                
                user = User.from_db_row(user_data)
                if not user.verify_password(password):
                    raise ValueError("비밀번호가 일치하지 않습니다.")
                
                return user