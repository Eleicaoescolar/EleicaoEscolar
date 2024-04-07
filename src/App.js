import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// PAGES
import Logar from './paginas/Login';
import Inicio from './paginas/Inicio';
import Urna from './paginas/Urna';
import Consulta from './paginas/Consulta';
import Erro404 from './paginas/Erro404';

// COMPONENTS
import Navbar from './components/Navbar';

import { auth } from './firebase/login';
import { getCookie, limparCookies, setCookie, deleteCookie } from './firebase/cookies';


const App = () => {

  const logado = getCookie('logado');
  if (logado && logado !== '') {
    auth.onAuthStateChanged( async function(user) {
      if (!user) {
        localStorage.clear();
        limparCookies();
        window.location.href = "/login";
      } else {
        const email = await user.email;
        const emailLocal = await getCookie('email');
        
        if (emailLocal !== email) {
          await localStorage.clear();
          await limparCookies();
          await auth.signOut();
          window.location.href = "/logar";
        }
      }
    });
  }
  


  return (
    <Router>
      <Routes>
        <Route path="/" element={<Logar />} />
        <Route path="/logar" element={<Logar />} />
        <Route
          path="/painel/*"
          element={
            <div>
              <Navbar />
              <Routes>
                <Route path="/" element={<Inicio />} />
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
