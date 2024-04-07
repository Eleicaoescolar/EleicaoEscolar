import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/Inicio.css';

// ICONES
import Swal from 'sweetalert';
import { IonIcon } from '@ionic/react';
import * as IoniconsIcons from 'ionicons/icons';
import { getCookie, limparCookies, setCookie, deleteCookie } from '../firebase/cookies';
import { auth } from '../firebase/login';
import { lerEscolas, lerChapas, salvarChapas, salvarInformacoesEleicao } from '../firebase/dados';

const Erro = () => {

  const logado = getCookie('logado');
  const pagina = window.location.pathname.slice(1);
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
  } else if (!logado && pagina !== 'login' && pagina !== '') {
    localStorage.clear();
    limparCookies();
    window.location.href = "/";
  }

  const email = getCookie('email');

  // CARD DE INFORMAÇÕES
  const [cardInformacoes, setCardInformacoes] = useState(false);
  const [statusCardInformacoes, setStatusCardInformacoes] = useState(false);
  const [nomeEscola, setNomeEscola] = useState('');
  const [escolaDaEleicao, setEscolaDaEleicao] = useState('');
  const [descricaoEleicao, setDescricaoEleicao] = useState('');

  // CARD DE CHAPAS 
  const [cardChapas, setCardChapas] = useState(false);
  const [statusCardChapas, setStatusCardChapas] = useState(false);
  const [chapas, setChapas] = useState([]);
  const [quantidadeChapas, setQuantidadeChapas] = useState(0);

  const handleInputChange = (index, event) => {
    const novasChapas = [...chapas];
    novasChapas[index] = event.target.value;
    setChapas(novasChapas);
  };

  const handleQuantidadeChapasChange = (event) => {
    const quantidade = parseInt(event.target.value);
    setQuantidadeChapas(quantidade);
    setChapas(Array(quantidade).fill(''));
  };

  
  // DADOS COLETADOS
  const [escolas, setEscolas] = useState([]);
  const [cardEscolas, setCardEscolas] = useState(true);

  const lerDados = async () => {
    try {
      const escolas = await lerEscolas();
      if (escolas) {
        setEscolas(escolas);
      }
    } catch (error) {
      console.log(error);
    }
  }

  const gerenciarEscola = async (escola, descricao) => {
    try {
      const chapas = await lerChapas(escola);
      if (chapas.length > 0) {
        setChapas(chapas);
        setStatusCardChapas(true);
        setQuantidadeChapas(chapas.length);
      }
      if (escola && descricao) {
        setEscolaDaEleicao(escola);
        setNomeEscola(escola);
        setDescricaoEleicao(descricao);
        setStatusCardInformacoes(true);
      }
      setCardInformacoes(true);
      setCardChapas(true);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    lerDados();
  }, []);

  return (
    <main className="container-inicio">
      
      <section className='content-inicio'>

        <h1 className='titulo mt-20'>Olá, {email}</h1>
        <p className='paragrafo mb-6'>Conclua todas as ações necessárias em uma única página.</p>
        <p className='paragrafo mb-6'> <div className='bola verde'></div> Concluído</p>
        <p className='paragrafo mb-6'> <div className='bola amarela'></div> Pendente</p>
        <p className='paragrafo mb-0'> <div className='bola vermelha'></div> Não concluído</p>
        

        {/* GERENCIAR ESCOLAS */}
        {escolas.length > 0 ? (
            <article className='card'>
              {/* SOBRE */}
              <div onClick={() => setCardEscolas(!cardEscolas)} className='sobre'>
                <h1> <div className='numero'> {escolas.length} </div> {`Gerenciar ${escolas.length === 1 ? 'Escola' : escolas.length > 1 ? 'Escolas' : 'Nenhuma escola encontrada'}`}</h1>
                {cardEscolas ? (
                  <IonIcon icon={IoniconsIcons.chevronUp} />
                ) : (
                  <IonIcon icon={IoniconsIcons.chevronDown} />
                )}
              </div>
              {/* GERENCIAR */}
              {cardEscolas && (
                <>
                  <div className='linha'></div>
                  <div className='gerenciar'>
                    {escolas.map((val, index) => (
                        <div className='flex justify-content-between'>
                          <div className='column escola'>
                            <h1>{val.escola}</h1>
                            <p>{val.descricao}</p>
                          </div>
                          <button className='ml-auto mr-10' onClick={() => gerenciarEscola(val.escola, val.descricao)}>Gerenciar</button>
                        </div>
                    ))}
                  </div>
                </>
              )}
            </article>
        ) : (
          <></>
        )}
        

        {/* ADICIONAR INFORMAÇÕES DA ELEIÇÃO */}
        <article className='card'>
          {/* SOBRE */}
          <div onClick={() => setCardInformacoes(!cardInformacoes)} className='sobre'>
          <h1> <div className={`bola ${statusCardInformacoes ? 'verde' : 'vermelha'}`}></div> Adicionar Informações da Eleição </h1>
            {cardInformacoes ? (
              <IonIcon icon={IoniconsIcons.chevronUp} />
            ) : (
              <IonIcon icon={IoniconsIcons.chevronDown} />
            )}
          </div>
          {/* GERENCIAR */}
          {cardInformacoes && (
            <>
              <div className='linha'></div>
              <div className='gerenciar'>
                <div className='formulario'>
                  <div className='input mt-5'>
                    <input value={nomeEscola} onChange={(e) => setNomeEscola(e.target.value)} type='text' placeholder=''/>
                    <label>Nome da Escola</label>
                  </div>
                  <div className='input'>
                    <input value={descricaoEleicao} onChange={(e) => setDescricaoEleicao(e.target.value)} type='text' placeholder=''/>
                    <label>Descrição da Eleição</label>
                  </div>
                </div>
                <button className='ml-0 mt-13 mb-15' onClick={() => salvarInformacoesEleicao(nomeEscola, descricaoEleicao)}>Salvar</button>
              </div>
            </>
          )}
        </article>

        {/* ADICIONAR CHAPAS */}
        <article className='card'>
          {/* SOBRE */}
          <div onClick={() => setCardChapas(!cardChapas)} className='sobre'>
            <h1> <div className={`bola ${statusCardChapas ? 'verde' : 'vermelha'}`}></div> Adicionar Chapas da Eleição </h1>
            {cardChapas ? (
              <IonIcon icon={IoniconsIcons.chevronUp} />
            ) : (
              <IonIcon icon={IoniconsIcons.chevronDown} />
            )}
          </div>
          {/* GERENCIAR */}
          {cardChapas && (
            <>
              <div className='linha'></div>
              <div className='gerenciar'>
                <div className='formulario'>
                  <div className='input'>
                    <select value={escolaDaEleicao} onChange={(e) => setEscolaDaEleicao(e.target.value)}>
                      <option>Selecione..</option>
                      {escolas.map((val) => (
                        <option value={`${val.escola}`}>{val.escola}</option>
                      ))}  
                    </select>
                    <label>Escola da Eleição</label>
                  </div>
                  {escolaDaEleicao ? (
                    <div className='input'>
                      <select value={quantidadeChapas} onChange={(e) => setQuantidadeChapas(e.target.value)}>
                        <option>Selecione..</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                        <option value={5}>5</option>
                      </select>
                      <label>Quantidade de Chapas</label>
                    </div>
                  ) : (
                    <></>
                  )}
                  
                  {quantidadeChapas > 0 ? (
                    <>
                        {Array.from({ length: quantidadeChapas }, (_, i) => (
                          <div className='input' key={i + 1}>
                              <input onChange={(event) => handleInputChange(i, event)} value={chapas[i] || ''} type='text' placeholder='' />
                              <label>Nome da Chapa - {i + 1} </label>
                          </div>
                      ))}
                    </>
                  ) : (
                    <></>
                  )}
                  
                </div>
                <button className='ml-0 mt-13 mb-15' onClick={() => salvarChapas(escolaDaEleicao, chapas)}>Salvar</button>
              </div>
            </>
          )}
        </article>

        {/* IR PARA URNA ELETRÕNICA */}
        {statusCardChapas && statusCardInformacoes ? (
          <article className='card'>
            {/* SOBRE */}
            <div className='sobre cursor-default pointer-events-all'>
              <h1> Ir para Urna Eletrônica </h1>
              <IonIcon className='verde' icon={IoniconsIcons.checkmarkCircle} />
            </div>
            {/* GERENCIAR */}
            <>
              <div className='linha'></div>
              <div className='gerenciar'>
                <div className='column mb-10'>
                  <h1>A Eleição da Escola <strong className='azul'> '{nomeEscola}' </strong> possui {chapas.length} Chapas:</h1>
                  {chapas.map((chapa, index) => (
                    <p> Chapa {index + 1} - <strong className='azul'>{chapa}</strong> </p>
                  ))}
                  <p></p>
                </div>
              </div>
            </>
          
          </article>
        ) : (
          <></>
        )}
        

      </section>

    </main>
  );
};


export default Erro;