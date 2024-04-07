import firebase from 'firebase/compat/app';
import { firebaseConfig } from './firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import { getCookie, limparCookies, setCookie, deleteCookie } from './cookies';
import Swal from 'sweetalert';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


const dataAtual = new Date();
const anoAtual = dataAtual.getFullYear();
localStorage.setItem('ano', anoAtual);
const ANO = localStorage.getItem('ano');

const email = getCookie('email');

const lerChapas = async (escola) => {
    var chapas = [];
    const ler = new Promise( async (resolve, reject) => {
        try {
            
            await db.collection(ANO)
            .doc('usuarios')
            .collection(email)
            .doc(email)
            .collection('eleicoes')
            .doc(escola)
            .collection('chapas')
            .onSnapshot((data) => {
                data.docs.map((val) => {
                    const chapa = val.data().nome;
                    chapas.push(chapa);
                });
                resolve(chapas);
            });

        } catch (error) {
            console.error('Erro ao coletar dados:', error.message);
        }
    });
    return ler;
}


const lerEscolas = async () => {
    var escolas = [];
    const ler = new Promise( async (resolve, reject) => {
        try {
            await db.collection(ANO)
            .doc('usuarios')
            .collection(email)
            .doc(email)
            .collection('eleicoes')
            .onSnapshot((data) => {
                data.docs.map((val) => {
                    const escola = val.data().escola;
                    const descricao = val.data().descricao;
                    escolas.push({
                        escola,
                        descricao,
                    });
                });
                resolve(escolas);
            });
        } catch (error) {
            console.error('Erro ao coletar dados:', error.message);
        }
    });
    return ler;
}


const salvarInformacoesEleicao = async (escola, descricao) => {
    const salvar = new Promise( async (resolve, reject) => {
        try {
            if (!escola) {
                Swal({
                    title: 'Digite o nome da escola!',
                    icon: 'error',
                });
                resolve(false);
                return;
            }

            await db.collection(ANO)
            .doc('usuarios')
            .collection(email)
            .doc(email)
            .collection('eleicoes')
            .doc(escola).set({
                escola: escola,
                descricao: descricao,
            }).then((res) => {
                Swal({
                    title: 'Informações salvas com sucesso!',
                    icon: 'success',
                }).then((resposta) => {
                    window.location.reload();
                });
            });

        } catch (error) {
            console.error('Erro ao salvar informações:', error.message);
        }
    });
    return salvar;
};


const salvarChapas = async (escola, chapas) => {
    const salvar = new Promise( async (resolve, reject) => {
        try {
            if (!escola) {
                Swal({
                    title: 'Escolha a escola da eleição!',
                    icon: 'error',
                });
                resolve(false);
                return;
            }

            const chapasPromise = await chapas.map( async (chapa) => {
                await db.collection(ANO)
                .doc('usuarios')
                .collection(email)
                .doc(email)
                .collection('eleicoes')
                .doc(escola)
                .collection('chapas')
                .doc(chapa).set({
                    nome: chapa,
                });
            })

            const resposta = Promise.all(chapasPromise);
            if (resposta) {
                Swal({
                    title: 'Chapas salvas com sucesso!',
                    icon: 'success',
                }).then((resposta) => {
                    window.location.reload();
                });
            }

        } catch (error) {
            console.error('Erro ao salvar informações:', error.message);
        }
    });
    return salvar;
};


export { lerEscolas, lerChapas, salvarChapas, salvarInformacoesEleicao }