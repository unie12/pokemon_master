from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User:
    def __init__(self, username, email, password=None):
        self.user_id = None
        self.username = username
        self.email = email
        self.password_hash = generate_password_hash(password) if password else None
        self.last_gacha_time = None
        self.join_date = datetime.now()

    def verify_password(self, password):
        return check_password_hash(self.password_hash, password)

    @staticmethod
    def from_db_row(row):
        if not row:
            return None
        
        user = User(
            username=row[1],  # username
            email=row[2],     # email
        )
        user.user_id = row[0]           # user_id
        user.password_hash = row[3]      # password hash
        user.last_gacha_time = row[4]    # last_gacha_time
        user.join_date = row[5]          # join_date
        return user

    def to_dict(self):
        return {
            'user_id': self.user_id,
            'username': self.username,
            'email': self.email,
            'last_gacha_time': self.last_gacha_time.isoformat() if self.last_gacha_time else None,
            'join_date': self.join_date.isoformat() if self.join_date else None
        }