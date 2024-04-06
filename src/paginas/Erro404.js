import React, { useEffect, useState } from 'react';
//import logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Erro.css';

// ICONES
import Swal from 'sweetalert';
import { IonIcon } from '@ionic/react';
import * as IoniconsIcons from 'ionicons/icons';

const Erro = () => {

  return (
    <main className="container-erro">
      
        <img src={require('../img/erro404.png')} />
        <h1>Oops, Página não encontrada!</h1>
        <Link to="/">
            Voltar para o início
        </Link>

    </main>
  );
};


export default Erro;