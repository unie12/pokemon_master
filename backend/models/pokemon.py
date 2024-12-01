# models/pokemon.py
class Pokemon:
    def __init__(self, id, pokedex_number, name, type1, type2, total, hp, attack, defense, 
                 sp_attack, sp_defense, speed, image_path):
        self.id = id
        self.pokedex_number = pokedex_number
        self.name = name
        self.type1 = type1
        self.type2 = type2
        self.total = total
        self.hp = hp
        self.attack = attack
        self.defense = defense
        self.sp_attack = sp_attack
        self.sp_defense = sp_defense
        self.speed = speed
        self.image_path = image_path

    @staticmethod
    def from_db_row(row):
        return Pokemon(*row)

    def to_dict(self):
        return {
            'id': self.id,
            'pokedex_number': self.pokedex_number,
            'name': self.name,
            'type1': self.type1,
            'type2': self.type2,
            'total': self.total,
            'hp': self.hp,
            'attack': self.attack,
            'defense': self.defense,
            'sp_attack': self.sp_attack,
            'sp_defense': self.sp_defense,
            'speed': self.speed,
            'image_path': f'/static/images/{self.id}.png'
        }