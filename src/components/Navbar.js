import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../css/Navbar.css';

// ICONES
import Swal from 'sweetalert';
import { IonIcon } from '@ionic/react';
import * as IoniconsIcons from 'ionicons/icons';
import { getCookie, limparCookies, setCookie, deleteCookie } from '../firebase/cookies';
import { auth } from '../firebase/login';

const Erro = () => {

    const location = useLocation();
    const pagina = location.pathname.slice(1);

    const email = getCookie('email');
    
    // STATES
    const [popupIcons, setPopupIcons] = useState(false);

    const sairDaConta = () => {
        limparCookies();
        localStorage.clear();
        auth.signOut().then((res) => {
            window.location.href = "/";
        });
    }

    return (
        <header className="navbar">
            
            <div style={{display: 'flex', alignItems: 'center'}}>
                <img className='logo' src={require('../img/urna.png')} />
                <h1 className='logo'>Eleição Escolar</h1>
            </div>
            
            <nav className='links'>
                <Link className={pagina === 'painel' || pagina === 'painel/' || pagina === 'painel/inicio' ? 'selecionado' : ''} to="/painel/inicio">
                    Início
                </Link>
                <Link className={pagina === 'painel/urna' || pagina === 'painel/urna/' ? 'selecionado' : ''} to="/painel/urna">
                    Urna Eletrônica
                </Link>
                <Link className={pagina === 'painel/consulta' || pagina === 'painel/consulta/' ? 'selecionado' : ''} to="/painel/consulta">
                    Consulta
                </Link>
            </nav>

            <div className='icons'>
                <IonIcon onClick={() => setPopupIcons(!popupIcons)} icon={IoniconsIcons.personCircleOutline} />
            </div>

            {popupIcons && (
                <div className='popup-icons'>
                                    
                    <h1>Olá, <strong>{email}</strong></h1>

                    <ul>
                        <li>
                            <IonIcon icon={IoniconsIcons.shareSocial} />
                            <p>Compartilhar Site</p>
                        </li>
                        <li>
                            <IonIcon icon={IoniconsIcons.qrCode} />
                            <p>Colaborar com PIX</p>
                        </li>
                    </ul>

                    <a onClick={sairDaConta}>Sair</a>

                </div>
            )}
            
            
        </header>
    );
};


export default Erro;