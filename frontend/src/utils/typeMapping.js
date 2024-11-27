export const TYPE_MAPPING = {
    'Normal': '노말',
    'Fire': '불꽃',
    'Water': '물',
    'Electric': '전기',
    'Grass': '풀',
    'Ice': '얼음',
    'Fighting': '격투',
    'Poison': '독',
    'Ground': '땅',
    'Flying': '비행',
    'Psychic': '에스퍼',
    'Bug': '벌레',
    'Rock': '바위',
    'Ghost': '고스트',
    'Dragon': '드래곤',
    'Dark': '악',
    'Steel': '강철',
    'Fairy': '페어리'
  };
  
  export const REVERSE_TYPE_MAPPING = Object.fromEntries(
    Object.entries(TYPE_MAPPING).map(([eng, kor]) => [kor, eng])
  );