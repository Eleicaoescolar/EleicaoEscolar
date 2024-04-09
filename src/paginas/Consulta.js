import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCookie, limparCookies, setCookie, deleteCookie } from '../firebase/cookies';
import '../css/Consulta.css';
import { lerEscolas, lerEleicoesFinalizadas } from '../firebase/dados';
import { db, auth } from '../firebase/login';
import MyComponent from '../css/confetti';

// ICONES
import Swal from 'sweetalert';
import { IonIcon } from '@ionic/react';
import * as IoniconsIcons from 'ionicons/icons';

const Consulta = () => {

    const logado = getCookie('logado');
    const pagina = window.location.pathname.slice(1);
    if (logado && logado !== '') {
      auth.onAuthStateChanged( async function(user) {
        if (!user) {
          localStorage.clear();
          limparCookies();
          window.location.href = "/logar";
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
  


    // DADOS
    const dataAtual = new Date();
    const anoAtual = dataAtual.getFullYear();
    localStorage.setItem('ano', anoAtual);
    const ANO = localStorage.getItem('ano');
    const email = getCookie('email');

    const [eleicoes, setEleicoes] = useState([]);
    const [cardEleicoes, setCardEleicoes] = useState(true);
    const [content, setContent] = useState(true);
    const [ganhadores, setGanhadores] = useState([]);
    const [chapaGanhadora, setChapaGanhadora] = useState('');
    const [quantidadeDeVotos, setQuantidadeDeVotos] = useState('');
    const [escolaDaEleicao, setEscolaDaEleicao] = useState('');

    const lerDados = async () => {
        try {
          const eleicoes = await lerEleicoesFinalizadas();
          if (eleicoes) {
            setEleicoes(eleicoes);
          }
        } catch (error) {
          console.log(error);
        }
    }

    useEffect(() => {
        lerDados();
    }, []);

    const mostrarGanhadores = async (eleicao) => {
        var chapas = [];
        const ler = new Promise( async (resolve, reject) => {
            await db.collection(ANO)
            .doc('usuarios')
            .collection(email)
            .doc(email)
            .collection('eleicoes')
            .doc(eleicao)
            .collection('chapas')
            .onSnapshot( async (data) => {
                data.docs.map((val) => {
                    const branco = val.id;
                    const chapa = val.data().nome;
                    const votos = val.data().votos || 0;
                    if (branco === 'branco') {
                        chapas.push({
                            chapa: branco,
                            votos: votos,
                        });
                        return;
                    }
                    chapas.push({
                        chapa,
                        votos,
                    });
                });
                resolve(chapas); 
            });
        })

        await ler;
        await chapas.sort((a, b) => b.votos - a.votos);
        await setGanhadores(chapas);
        setContent(false); 
        setChapaGanhadora(chapas[0].chapa); 
        setQuantidadeDeVotos(chapas[0].votos); 
        setEscolaDaEleicao(eleicao);
    }

  return (
    <main className="container-consulta">
        {content ? (
            <section className='content-consulta'>

                <h1 className='titulo mt-20'>Consultar resultado das eleições</h1>
                <p className='paragrafo'>Na página, você encontrará os votos contabilizados e os vencedores, oferecendo uma visão clara e rápida do resultado das eleições.</p>

                {eleicoes.length > 0 ? (
                <article className='card'>
                    {/* SOBRE */}
                    <div onClick={() => setCardEleicoes(!cardEleicoes)} className='sobre'>
                    <h1> <div className='numero'> {eleicoes.length} </div> {`Gerenciar ${eleicoes.length === 1 ? 'Eleição' : eleicoes.length > 1 ? 'Eleições' : 'Nenhuma escola encontrada'}`}</h1>
                    {cardEleicoes ? (
                        <IonIcon icon={IoniconsIcons.chevronUp} />
                    ) : (
                        <IonIcon icon={IoniconsIcons.chevronDown} />
                    )}
                    </div>
                    {/* GERENCIAR */}
                    {cardEleicoes && (
                    <>
                        <div className='linha'></div>
                        <div className='gerenciar'>
                        {eleicoes.map((val, index) => (
                            <>
                                {val.status === '000' ? (
                                    <>
                                        <div className='wd-100 flex justify-content-between'>
                                            <div className='wd-max-content mx-wd-70 column escola'>
                                                <h1>{val.escola}</h1>
                                                <p>{val.descricao}</p>
                                            </div>
                                            <button className='ml-auto mr-10 btn-verde' onClick={() => mostrarGanhadores(val.escola)}> Mostrar Ganhadores </button>
                                        </div>
                                    </>
                                ) : (
                                    <h1>Nenhuma Eleição Finalizada encontrada</h1>
                                )}
                            </>
                        ))}
                        </div>
                    </>
                    )}
                </article>
            ) : (
                <h1 className='not-found'>Nenhuma Eleição Finalizada!</h1>
            )}

            </section>
        ) : (
            <section className='ganhadores'>
                
                {ganhadores.length > 0 ? (
                    <>
                        <MyComponent />
                        <h1 className='wd-90 mx-wd-600px titulo mt-35'>Parabéns a chapa ganhadora, <strong className='mr-0'> {chapaGanhadora}</strong>, com {quantidadeDeVotos} Votos</h1>
                        <p className='wd-90 mx-wd-600px paragrafo'>Leia a tabela abaixo com as informações da eleição escolar {escolaDaEleicao}, e comemore com sua chapa vencedora 🎉🥳</p>
                        <table>
                            <tr>
                                <th>Posição</th>
                                <th>Chapa</th>
                                <th>Votos</th>
                            </tr>             
                            {ganhadores.map((val, index) => (
                                <tr>
                                <td>{index + 1}º</td>
                                    <td>{val.chapa}</td>
                                    <td>{val.votos}</td>
                                </tr>
                            ))}
                                           
                        </table>
                    </>
                ) : (
                    <></>
                )}
            </section>
        )}
        
      
    </main>
  );
};


export default Consulta;