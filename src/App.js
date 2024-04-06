import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// PAGES
import Logar from './paginas/Login';
import Inicio from './paginas/Inicio';
import Urna from './paginas/Urna';
import Consulta from './paginas/Consulta';
import Erro404 from './paginas/Erro404';


const App = () => {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Logar />} />
        <Route path="/logar" element={<Logar />} />
        <Route
          path="/painel/*"
          element={
            <div>
              <Routes>
                <Route path="/inicio" element={<Inicio />} />
                <Route path="/urna" element={<Urna />} />
                <Route path="/consulta" element={<Consulta />} />
                <Route path="/*" element={<Erro404 />} />
              </Routes>
            </div>
          }
        />
        <Route path="/*" element={<Erro404 />} />
      </Routes>
    </Router>
  );

}

export default App;
