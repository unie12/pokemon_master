import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import PokemonList from './pages/PokemonList';
import PokemonDetail from './pages/PokemonDetail';
import Auth from './pages/Auth';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';

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
                    </Routes>
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;