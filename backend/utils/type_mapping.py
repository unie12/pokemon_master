TYPE_MAPPING = {
    '노말': 'Normal',
    '불꽃': 'Fire',
    '물': 'Water',
    '전기': 'Electric',
    '풀': 'Grass',
    '얼음': 'Ice',
    '격투': 'Fighting',
    '독': 'Poison',
    '땅': 'Ground',
    '비행': 'Flying',
    '에스퍼': 'Psychic',
    '벌레': 'Bug',
    '바위': 'Rock',
    '고스트': 'Ghost',
    '드래곤': 'Dragon',
    '악': 'Dark',
    '강철': 'Steel',
    '페어리': 'Fairy'
}

def get_korean_type(eng_type):
    reverse_mapping = {v: k for k, v in TYPE_MAPPING.items()}
    return reverse_mapping.get(eng_type, eng_type)

def get_english_type(kor_type):
    return TYPE_MAPPING.get(kor_type, kor_type)