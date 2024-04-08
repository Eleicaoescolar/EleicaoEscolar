import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getCookie, limparCookies, setCookie, deleteCookie } from '../firebase/cookies';
import { enviarVoto, enviarVotoBranco, lerChapas, lerEscolas } from '../firebase/dados';
import { auth, db } from '../firebase/login';
import '../css/Urna.css';
import Swal from 'sweetalert';

// ICONES
import { IonIcon } from '@ionic/react';
import * as IoniconsIcons from 'ionicons/icons';

const Urna = () => {

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

  const dataAtual = new Date();
  const anoAtual = dataAtual.getFullYear();
  localStorage.setItem('ano', anoAtual);
  const ANO = localStorage.getItem('ano');
  const email = getCookie('email');

  
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

  useEffect(() => {
    lerDados();
  }, []);

  /*

    CÓDIGOS DE STATUS

    000 - Eleição finalizada.
    111 - Eleição pronta para iniciar.
    222 - Eleição com dados incompletos.
    333 - Eleição em andamento.

  */

  const [urna, setUrna] = useState(false);
  const [content, setContent] = useState(true);
  const [chapas, setChapas] = useState([]);
  const [numeros, setNumeros] = useState([]);
  const [imagens, setImagens] = useState([]);
  const [escolaDaEleicao, setEscolaDaEleicao] = useState('');
  const [descricaoDaEleicao, setDescricaoDaEleicao] = useState('');
  const [resultadoVoto, setResultadoVoto] = useState(false);
  const [voto, setVoto] = useState('');
  const [nomeDaChapa, setNomeDaChapa] = useState('');
  const [urlDaImagem, setUrlDaImagem] = useState('');
  
  const navigate = useNavigate();

  const definirStatusEleicao = (escola, status) => {
    db.collection(ANO)
    .doc('usuarios')
    .collection(email)
    .doc(email)
    .collection('eleicoes')
    .doc(escola).update({
      status: status,
    });

  }

  const iniciarEleicao = async (escola, descricao) => {
    try {
      await Swal({
        title: `Você deseja iniciar a eleição ${escola}?`,
        icon: 'warning',
        buttons: {
          confirm: 'Sim',
          cancel: 'Não',
        }
      }).then( async (res) => {
        if (res) {
          const { chapas, imagens, numeros } = await lerChapas(escola);
          await definirStatusEleicao(escola, '333');
          setEscolaDaEleicao(escola);
          setDescricaoDaEleicao(descricao);
          setChapas(chapas);
          setNumeros(numeros);
          setImagens(imagens);
          setContent(false);
          setUrna(true);
          navigate('/painel/urna#expanded');
        }
      });
    } catch (error) {
      console.log(error);
    }
  }

  const voltarEleicao = async (escola, descricao) => {
    try {
     
      const { chapas, imagens, numeros } = await lerChapas(escola);
      setEscolaDaEleicao(escola);
      setDescricaoDaEleicao(descricao);
      setChapas(chapas);
      setNumeros(numeros);
      setImagens(imagens);
      setContent(false);
      setUrna(true);
      navigate('/painel/urna#expanded');
    
    } catch (error) {
      console.log(error);
    }
  }

  

  const adicionarVoto = async (numero) => {
    try {
      const digitos = voto.length;
      
      var votoAtual = '';
      if (digitos >= 2) {
        setVoto(voto.slice(0,2));
        votoAtual = voto.slice(0,2);
      }
      if (digitos === 0) {
        setVoto(`${numero}`);
        votoAtual = `${numero}`;
      } else if (digitos === 1) {
        setVoto(`${voto}${numero}`);
        votoAtual = `${voto}${numero}`;
      }

      
      await verificarChapa(votoAtual);
      
    } catch (error) {
      console.log(error);
    }
  }

  const limparVoto = async () => {
    try {
      setVoto('');
      setNomeDaChapa('');
      setUrlDaImagem('');
    } catch (error) {
      console.log(error);
    }
  }

  const verificarChapa = async (numeroVoto) => {
    const index = numeros.indexOf(numeroVoto);
    const chapa = chapas[index];
    const imagem = imagens[index];
    if (index === -1) {
      setNomeDaChapa('Nenhuma chapa encontrada');
      setUrlDaImagem('');
      return;
    }
    setNomeDaChapa(chapa);
    setUrlDaImagem(imagem);
  }

  const confirmarVoto = async () => {
    try {
      if (!escolaDaEleicao || !nomeDaChapa || !voto) {
        return;
      }
      const resposta = await enviarVoto(escolaDaEleicao, nomeDaChapa, voto);
      if (resposta) {
        concluirVoto();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const confirmarVotoBranco = async () => {
    try {
      const resposta = await enviarVotoBranco(escolaDaEleicao);
      if (resposta) {
        concluirVoto();
      }
    } catch (error) {
      console.log(error);
    }
  }

  const concluirVoto = () => {
    setResultadoVoto(true);
    reproduzirSom();
    setTimeout(() => {
      setResultadoVoto(false);
      setNomeDaChapa('');
      setUrlDaImagem('');
      setVoto('');
    }, 4000);
  }

  function reproduzirSom() {
    const audio = new Audio('/music/confirma-urna.mp3');
    audio.play();
  }
  
  
  const location = useLocation();

  // Função para verificar se a rota atual é '/painel/urna#expanded'
  const isUrnaExpandedRoute = () => {
    return location.pathname === '/painel/urna' && location.hash === '#expanded';
  }

  return (
    <main className={`container-urna ${isUrnaExpandedRoute() && 'sem-navbar'}`}>

      {content && (
          <section className='content-urna'>

          <h1 className='titulo mt-20'>Urna Eletrônica</h1>
          <p className='paragrafo'>Após iniciar a votação, você só poderá finalizá-la. Não será possível voltar atrás após a votação ser finalizada.</p>

          {/* GERENCIAR ELEIÇÔES */}
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
                          <div className='wd-100 flex justify-content-between'>
                            <div className='wd-max-content mx-wd-70 column escola'>
                              <h1>{val.escola}</h1>
                              <p>{val.descricao}</p>
                            </div>
                            {val.status === '333' ? (
                                <>
                                  <button className='ml-auto mr-10 btn-laranja' onClick={() => voltarEleicao(val.escola, val.descricao)}> Continuar Eleição </button>
                                  <button className='ml-15 mr-0'> Finalizar Eleição </button>
                                </>
                            ) : val.status === '222' ? (
                                <button className='ml-auto mr-10 btn-vermelho' onClick={() => 
                                  Swal(
                                    {title: 'Não é possível iniciar a eleição. ERRO: Dados incompletos!', 
                                    icon: 'error',
                                  })
                                }> Dados incompletos </button>
                            ) : val.status === '000' ? (
                              <button className='ml-auto mr-10 btn-verde' onClick={() => 
                                Swal(
                                  {title: 'Em breve!', 
                                  icon: 'success',
                                })
                              }> Consultar Votos </button>
                            ) : (
                              <button className='ml-auto mr-10' onClick={() => iniciarEleicao(val.escola, val.descricao)}> Iniciar Eleição </button>
                            )}
                          </div>
                      ))}
                    </div>
                  </>
                )}
              </article>
          ) : (
            <></>
          )}

        </section>
      )}
      
      {urna && (
        <section className='urna'>
        
          <article className='tela'>
            <h1>Eleição Escolar - 0.2.1</h1>
            <div className='linha'></div>
            <div className='wd-100 flex justify-content-between'>
              {resultadoVoto ? (
                <p className='fim'>FIM!</p>
              ) : (
                <>
                  <div className='column'>
                    <h2>Seu Voto</h2>
                    <div className='flex mt-5'>
                      <h1 className='voto'>{voto.slice(0,1)}</h1>
                      <h1 className='voto'>{voto.slice(1)}</h1>
                    </div>
                    
                    <h2>Nome da Chapa</h2>
                    <p>{nomeDaChapa ? nomeDaChapa : 'VOTO NULO'}</p>
                  </div>
                  <div className='column'>
                    <h2>Foto da Chapa</h2>
                    <div className='imagem'>
                      <img src={urlDaImagem} />
                      {!urlDaImagem ? (<p>?</p>) : ''}
                    </div>
                  </div>
                </>
              )}
                
            </div>
            <div className='linha'></div>
            <div className='column instrucao'>
              <p>Digite o Número e Aperte a Tecla CONFIRMAR para Confirmar o Voto</p>
              <p>Para Votar em Branco Aperte a Tecla BRANCO e depois CONFIRMAR</p>
              <p>Para Corrigir o Número Aperte CORRIGE digite o Número Novamente e Aperte CONFIRMAR</p>
              <p>Número Inexistente Depois CONFIRMAR o Voto Será Anulado</p>
            </div>
          </article>

          <article className='botoes'>
            <div className='column informacoes'>
              <h1>Nome da Escola</h1>
              <p>{escolaDaEleicao}</p>

              <h1>Descrição da eleição</h1>
              <p>{descricaoDaEleicao}</p>
            </div>
            <div className='btns'>
              <div className='column'>
                <div className='flex'>
                  <button onClick={() => adicionarVoto('1')} className='btn-numero'>1</button>
                  <button onClick={() => adicionarVoto('2')} className='btn-numero'>2</button>
                  <button onClick={() => adicionarVoto('3')} className='btn-numero'>3</button>
                </div>
                <div className='flex'>
                  <button onClick={() => adicionarVoto('4')} className='btn-numero'>4</button>
                  <button onClick={() => adicionarVoto('5')} className='btn-numero'>5</button>
                  <button onClick={() => adicionarVoto('6')} className='btn-numero'>6</button>
                </div>
                <div className='flex'>
                  <button onClick={() => adicionarVoto('7')} className='btn-numero'>7</button>
                  <button onClick={() => adicionarVoto('8')} className='btn-numero'>8</button>
                  <button onClick={() => adicionarVoto('9')} className='btn-numero'>9</button>
                </div>
                <div className='flex'>
                  <button onClick={() => adicionarVoto('0')} className='btn-numero'>0</button>
                </div>
              </div>
              <div className='flex mt-20 mb-15'>
                <button onClick={confirmarVotoBranco} className='btn-votar branco'>Branco</button>
                <button onClick={limparVoto} className='btn-votar corrige'>Corrige</button>
                <button onClick={confirmarVoto} className='btn-votar confirma'>COnfirma</button>
              </div>
            </div>

          </article>
          

        </section>
      )}
      
    </main>
  );
};


export default Urna;