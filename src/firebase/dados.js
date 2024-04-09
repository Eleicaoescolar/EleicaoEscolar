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
    const dados = { chapas: [], imagens: [], numeros: [] };
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
                    const votoBranco = val.id;
                    const chapa = val.data().nome;
                    const imagem = val.data().imagem;
                    const numero = val.data().numero;
                    if (votoBranco === 'branco') {
                        return false;
                    }
                    dados.chapas.push(chapa);
                    dados.numeros.push(numero);
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
                    const status = val.data().status;
                    escolas.push({
                        escola,
                        descricao,
                        status,
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


const lerEleicoesFinalizadas = async () => {
    var eleicoes = [];
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
                    const status = val.data().status;
                    if (status === '000') {
                        eleicoes.push({
                            escola,
                            descricao,
                            status,
                        });
                    }
                });
                resolve(eleicoes);
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
                status: '222',
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

const salvarChapas = async (escola, chapas, imagensChapas, numeros) => {
    try {
        if (!escola) {
            Swal({
                title: 'Escolha a escola da eleição!',
                icon: 'error',
            });
            return false;
        }
        
        const chapasPromise = chapas.map(async (chapa, index) => {
            if (chapa === 'branco') {
                Swal({
                    title: 'Não pode criar uma chapa com o nome "branco"!',
                    icon: 'error',
                });
                return false;
            }
            const numeroChapa = numeros[index];

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
                        numero: numeroChapa,
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
                        numero: numeroChapa,
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
                        numero: numeroChapa,
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
                        numero: numeroChapa,
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

const enviarVoto = async (escola, chapa, voto) => {
    try {
        
        const chapaRef = db.collection(ANO)
        .doc('usuarios')
        .collection(email)
        .doc(email)
        .collection('eleicoes')
        .doc(escola)
        .collection('chapas')
        .doc(chapa);

        const doc = await chapaRef.get();
        if (doc.exists) {

            const numeroDeVoto = doc.data().numero;
            if (numeroDeVoto === voto) {
                
                const votosAtuais = doc.data().votos || 0;
                const novosVotos = votosAtuais + 1;
    
                await chapaRef.update({
                    votos: novosVotos
                });
    
                return true;    
            } else {
                return false;
            }


        } else {
            console.log('Chapa não encontrada.');
            return false;
        }

    } catch (error) {
        console.error('Erro ao salvar informações:', error.message);
        return false;
    }
};


const enviarVotoBranco = async (escola) => {
    try {
        
        const docRef = db.collection(ANO)
        .doc('usuarios')
        .collection(email)
        .doc(email)
        .collection('eleicoes')
        .doc(escola)
        .collection('chapas')
        .doc('branco');

        const doc = await docRef.get();
        if (doc.exists) {

            const votosAtuais = doc.data().votos || 0;
            const novosVotos = votosAtuais + 1;

            await docRef.update({
                votos: novosVotos
            });

            return true;    
        
        } else {
            await docRef.set({
                votos: 1,
            });
            return true;   
        }

    } catch (error) {
        console.error('Erro ao salvar informações:', error.message);
        return false;
    }
};

async function deleteImagensStorage(directoryRef) {
    try {
        // Listar todos os itens no diretório
        const items = await directoryRef.listAll();

        // Excluir todos os itens
        await Promise.all(items.items.map(async (item) => {
            await item.delete();
        }));

        // Excluir a pasta em si
        await directoryRef.delete();

        console.log('Diretório e todos os itens foram excluídos com sucesso.');
    } catch (error) {
        console.error('Ocorreu um erro ao excluir o diretório:', error);
    }
}

const excluirEscola = async (escola) => {

    try {
        Swal({
            title: `Você deseja excluír a eleição da escola ${escola}?`,
            icon: 'warning',
            buttons: {
                confirm: 'Sim',
                cancel: 'Não',
            },
        }).then( async (resposta) => {
            if (resposta) {
                try {
                    const eleicaoRef = db.collection(ANO)
                        .doc('usuarios')
                        .collection(email)
                        .doc(email)
                        .collection('eleicoes')
                        .doc(escola);
            
                    const eleicaoSnapshot = await eleicaoRef.get();
            
                    if (eleicaoSnapshot.exists) {
                        const imagensRef = await storage.ref(`${ANO}/${escola}`)
                        await deleteImagensStorage(imagensRef);
                        await eleicaoRef.delete();
                        await Swal({
                            title: 'Eleição excluída com sucesso!',
                            icon: 'success',
                        }).then(() => {
                            window.location.reload();
                        });
                    } else {
                        Swal({
                            title: `Eleição da escola ${escola} não existe!`,
                            icon: 'error',
                        });
                    }
                } catch (error) {
                    console.error('Erro ao excluir eleição:', error);
                    Swal({
                        title: 'Erro ao excluir eleição!',
                        text: 'Por favor, tente novamente mais tarde.',
                        icon: 'error',
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
                    if (imagem) {
                        const storageRef = storage.refFromURL(imagem);
                        await storageRef.delete();
                    }
                    await dado.ref.delete();
                    await Swal({
                        title: 'Chapa excluída com sucesso!',
                        icon: 'success',
                    }).then(() => {
                        window.location.reload();
                    });
                } else {
                    Swal({
                        title: `Chapa ${chapa} não existe!`,
                        icon: 'error',
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


export { lerEscolas, lerChapas, salvarChapas, salvarInformacoesEleicao, excluirChapa, excluirEscola, enviarVoto, enviarVotoBranco, lerEleicoesFinalizadas }