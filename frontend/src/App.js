import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import PokemonList from "./pages/PokemonList";
import PokemonDetail from "./pages/PokemonDetail";
import MyPokemon from "./pages/MyPokemon";
import Gacha from "./pages/Gacha";
import Auth from "./pages/Auth";
import Ranking from "./pages/Ranking";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<PokemonList />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/mypokemon" element={<MyPokemon />} />
            <Route path="/gacha" element={<Gacha />} />
            <Route path="/ranking" element={<Ranking />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
