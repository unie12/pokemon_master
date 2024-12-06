import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { pokemonApi } from "../services/api";
import PokemonCard from "../components/PokemonCard";
import FilterPanel from "../components/FilterPanel";
import "./PokemonList.css";

const PokemonList = () => {
  const availableTypes = [
    "노말",
    "불꽃",
    "물",
    "전기",
    "풀",
    "얼음",
    "격투",
    "독",
    "땅",
    "비행",
    "에스퍼",
    "벌레",
    "바위",
    "고스트",
    "드래곤",
    "악",
    "강철",
    "페어리",
  ];

  const [pokemons, setPokemons] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [sortBy, setSortBy] = useState("pokedex_number");
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const navigate = useNavigate();

  const loadPokemons = useCallback(
    async (pageNum) => {
      if (loading) return;

      try {
        setLoading(true);
        const data = await pokemonApi.getPokemons(
          pageNum,
          sortBy,
          sortOrder,
          selectedTypes
        );

        if (pageNum === 1) {
          setPokemons(data.pokemons);
        } else {
          setPokemons((prev) => {
            const existingIds = new Set(prev.map((p) => p.id));
            const newPokemons = data.pokemons.filter(
              (p) => !existingIds.has(p.id)
            );
            return [...prev, ...newPokemons];
          });
        }

        setHasMore(data.has_more);
      } catch (error) {
        setError("Failed to load pokemons");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    },
    [sortBy, sortOrder, selectedTypes]
  );

  // 필터 변경 시 페이지 리셋
  const resetAndLoad = useCallback(() => {
    setPokemons([]);
    setPage(1);
    setHasMore(true);
    loadPokemons(1);
  }, [loadPokemons]);

  // 정렬 변경 처리
  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
  }, []);

  // 정렬 순서 변경 처리
  const handleSortOrderChange = useCallback((newOrder) => {
    setSortOrder(newOrder);
  }, []);

  // 타입 토글 처리
  const handleTypeToggle = useCallback((type) => {
    setSelectedTypes((prev) => {
      const newTypes = prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type];
      return newTypes;
    });
  }, []);

  // 초기 로딩 및 필터/정렬 변경 시
  useEffect(() => {
    resetAndLoad();
  }, [resetAndLoad, sortBy, sortOrder, selectedTypes]);

  // 페이지 변경 시 추가 데이터 로딩
  useEffect(() => {
    if (page > 1) {
      loadPokemons(page);
    }
  }, [page, loadPokemons]);

  // 무한 스크롤 처리
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollTop =
        (document.documentElement && document.documentElement.scrollTop) ||
        document.body.scrollTop;
      const scrollHeight =
        (document.documentElement && document.documentElement.scrollHeight) ||
        document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;
      const scrolledToBottom =
        Math.ceil(scrollTop + clientHeight) >= scrollHeight - 5;

      if (scrolledToBottom && !loading) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore]);

  if (error) return <div>Error: {error}</div>;

  return (
    <div className="pokemon-list">
      <h1>포켓몬 도감</h1>
      <FilterPanel
        sortBy={sortBy}
        sortOrder={sortOrder}
        selectedTypes={selectedTypes}
        onSortChange={handleSortChange}
        onSortOrderChange={handleSortOrderChange}
        onTypeToggle={handleTypeToggle}
        availableTypes={availableTypes}
      />
      <div className="pokemon-grid">
        {pokemons.map((pokemon) => (
          <PokemonCard
            key={pokemon.id}
            pokemon={pokemon}
            onClick={() => navigate(`/pokemon/${pokemon.id}`)}
          />
        ))}
      </div>
      {loading && <div className="loading">Loading more...</div>}
    </div>
  );
};

export default PokemonList;
