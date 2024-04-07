import firebase from 'firebase/compat/app';
import { firebaseConfig } from './firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/storage';
import { getCookie, limparCookies, setCookie, deleteCookie } from './cookies';
import Swal from 'sweetalert';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();


const dataAtual = new Date();
const anoAtual = dataAtual.getFullYear();
localStorage.setItem('ano', anoAtual);
const ANO = localStorage.getItem('ano');

const email = getCookie('email');

const lerChapas = async (escola) => {
    const dados = { chapas: [], imagens: [] };
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
                    const imagem = val.data().imagem;
                    dados.chapas.push(chapa);
                    dados.imagens.push(imagem ? imagem : null);
                });
                resolve(dados);
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

const salvarChapas = async (escola, chapas, imagensChapas) => {
    try {
        if (!escola) {
            Swal({
                title: 'Escolha a escola da eleição!',
                icon: 'error',
            });
            return false;
        }

        const chapasPromise = chapas.map(async (chapa, index) => {
            
            const dado = await db.collection(ANO)
            .doc('usuarios')
            .collection(email)
            .doc(email)
            .collection('eleicoes')
            .doc(escola)
            .collection('chapas')
            .doc(chapa).get();
            
            if (imagensChapas[index]) {
                const storageRef = storage.ref(`${ANO}/${escola}/chapas/${imagensChapas[index].name}`);
                await storageRef.put(imagensChapas[index]); // Faça o upload real da imagem para o armazenamento
                const imageUrl = await storageRef.getDownloadURL();

                if (dado.exists) {
                    await db.collection(ANO)
                    .doc('usuarios')
                    .collection(email)
                    .doc(email)
                    .collection('eleicoes')
                    .doc(escola)
                    .collection('chapas')
                    .doc(chapa)
                    .update({
                        nome: chapa,
                        imagem: imageUrl,
                    });
                } else {
                    await db.collection(ANO)
                    .doc('usuarios')
                    .collection(email)
                    .doc(email)
                    .collection('eleicoes')
                    .doc(escola)
                    .collection('chapas')
                    .doc(chapa)
                    .set({
                        nome: chapa,
                        imagem: imageUrl,
                    });
                }

            } else {
                
                if (dado.exists) {
                    await db.collection(ANO)
                    .doc('usuarios')
                    .collection(email)
                    .doc(email)
                    .collection('eleicoes')
                    .doc(escola)
                    .collection('chapas')
                    .doc(chapa)
                    .update({
                        nome: chapa,
                    });
                } else {
                    await db.collection(ANO)
                    .doc('usuarios')
                    .collection(email)
                    .doc(email)
                    .collection('eleicoes')
                    .doc(escola)
                    .collection('chapas')
                    .doc(chapa)
                    .set({
                        nome: chapa,
                    });
                }
                
                
            }
        });

        await Promise.all(chapasPromise); // Aguarde todas as promessas

        Swal({
            title: 'Chapas salvas com sucesso!',
            icon: 'success',
        }).then(() => {
            window.location.reload();
        });

        return true;
    } catch (error) {
        console.error('Erro ao salvar informações:', error.message);
        return false;
    }
};



const excluirChapa = async (escola, chapa) => {
    try {
        Swal({
            title: `Você deseja excluír a chapa ${chapa}?`,
            icon: 'warning',
            buttons: {
                confirm: 'Sim',
                cancel: 'Não',
            },
        }).then( async (resposta) => {
            if (resposta) {
                
                const dado = await db.collection(ANO)
                .doc('usuarios')
                .collection(email)
                .doc(email)
                .collection('eleicoes')
                .doc(escola)
                .collection('chapas')
                .doc(chapa).get();

                if (dado.exists) {
                    const imagem = dado.data().imagem;
                    const storageRef = storage.refFromURL(imagem);
                    await storageRef.delete();
                    await dado.ref.delete();
                    await Swal({
                        title: 'Chapa excluída com sucesso!',
                        icon: 'success',
                    }).then(() => {
                        window.location.reload();
                    });
                }
    
            }
        });

        
        return true;
    } catch (error) {
        console.error('Erro ao salvar informações:', error.message);
        return false;
    }
};


export { lerEscolas, lerChapas, salvarChapas, salvarInformacoesEleicao, excluirChapa }