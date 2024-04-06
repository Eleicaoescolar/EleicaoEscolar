import React, { useEffect, useState } from 'react';
//import logo from '../img/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Login.css';
import '../global.css';

// ICONES
import Swal from 'sweetalert';
import { IonIcon } from '@ionic/react';
import * as IoniconsIcons from 'ionicons/icons';
import { fazerCadastro, fazerLogin } from '../firebase/login';

const Login = () => {

  // PAGES
  const [mostrarInputSenha, setMostrarInputSenha] = useState(false);
  const [formularioLogar, setFormularioLogar] = useState(true);
  const [formularioCadastrar, setFormularioCadastrar] = useState(false);
  const [opacityFormulario, setOpacityFormulario] = useState(false);

  // INPUTS
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');


  const mostrarSenha = (event) => {
    const { checked } = event.target;
    setMostrarInputSenha(checked);
  }

  // ABRINDO FORMULARIOS
  const abrirFormularioCadastrar = () => {
    setFormularioCadastrar(true);
    setFormularioLogar(false);
    setOpacityFormulario(false);
    setTimeout(() => {
      setOpacityFormulario(true);
    }, 350);
    setMostrarInputSenha(false);
  }

  const abrirFormularioLogar = () => {
    setFormularioCadastrar(false);
    setFormularioLogar(true);  
    setOpacityFormulario(false);
    setTimeout(() => {
      setOpacityFormulario(true);
    }, 350);
    setMostrarInputSenha(false);
  }

  useEffect(() => {
    if (formularioCadastrar || formularioLogar) {
      setTimeout(() => {
        setOpacityFormulario(true);
      }, 350);
    } else {
      setOpacityFormulario(false);
    }
  }, [])

  return (
    <main className="container-login">
      
      <section className='dados-login'>
        
        {formularioLogar && (
          <div className={`formulario opacity-0 ${opacityFormulario ? 'opacity-1' : ''}`}>

            <h1>Bem-Vindo de Volta</h1>
            
            <div className='input'>
              <input onChange={(e) => setEmail(e.target.value)} type='text' placeholder='' />
              <label>Email</label>
            </div>

            <div className='input'>
              <input onChange={(e) => setSenha(e.target.value)} type={mostrarInputSenha ? 'text' : 'password'} placeholder='' />
              <label>Senha</label>
            </div>

            <div className='input-checkbox'>
              <input onChange={mostrarSenha} type='checkbox' />
              <p>Mostrar Senha</p>
            </div>

            <div className='button'>
              <button onClick={() => fazerLogin(email, senha)}>Entrar</button>
              <IonIcon icon={IoniconsIcons.arrowForward} />
            </div>

            <div className='p'>
              <p>Não possui cadastro? <strong onClick={abrirFormularioCadastrar}>Cadastrar</strong></p>
            </div>

          </div>
        )}

        {formularioCadastrar && (
          <div className={`formulario opacity-0 ${opacityFormulario ? 'opacity-1' : ''}`}>

            <h1>Fazer Cadastro</h1>
            
            <div className='input'>
              <input onChange={(e) => setEmail(e.target.value)} type='text' placeholder='' />
              <label>Email</label>
            </div>

            <div className='input'>
              <input onChange={(e) => setSenha(e.target.value)} type={mostrarInputSenha ? 'text' : 'password'} placeholder='' />
              <label>Senha</label>
            </div>

            <div className='input'>
              <input onChange={(e) => setConfirmarSenha(e.target.value)} type={mostrarInputSenha ? 'text' : 'password'} placeholder='' />
              <label>Confirmar Senha</label>
            </div>

            <div className='input-checkbox'>
              <input onChange={mostrarSenha} type='checkbox' />
              <p>Mostrar Senha</p>
            </div>

            <div className='button'>
              <button onClick={() => fazerCadastro(email, senha, confirmarSenha)}>Cadastrar</button>
              <IonIcon icon={IoniconsIcons.arrowForward} />
            </div>

            <div className='p'>
              <p>Já possui conta? <strong onClick={abrirFormularioLogar}>logar</strong></p>
            </div>

          </div>
        )}

      </section>

      <section className='imagem-login'>
        
        <div className={`sobre-login opacity-0 ${opacityFormulario ? 'opacity-1' : ''}`}>
          <h1>Nova Atualização disponível</h1>
          <p>Adicionamos novas funcionalidades em nosso site</p>
          <Link to='/'>
            Leia Mais
          </Link>  
        </div>

        <img className={`opacity-0 ${opacityFormulario ? 'opacity-1' : ''}`} src={require('../img/Voting.gif')} />

      </section>
      
    </main>
  );
};


export default Login;