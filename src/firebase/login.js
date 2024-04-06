import firebase from 'firebase/compat/app';
import { firebaseConfig } from './firebaseConfig';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import 'firebase/compat/database';
import 'firebase/compat/storage';
import Swal from 'sweetalert';
import { type } from '@testing-library/user-event/dist/type';


firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();


const dataAtual = new Date();
const anoAtual = dataAtual.getFullYear();
localStorage.setItem('ano', anoAtual);
const ANO = localStorage.getItem('ano');

// COOKIES
function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
  
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(nameEQ) == 0) {
        return c.substring(nameEQ.length, c.length);
      }
    }
    return null;
}
  
function deleteCookie(name) {   
    document.cookie = name+'=; Max-Age=-99999999;';  
}
  


const fazerLogin = (email, senha) => {
    const logar = new Promise( async (resolve, reject) => {
        const resposta = await authLogin(email, senha);
        const nome = resposta;
        if (resposta) {
            if (typeof nome === 'string') {
                setCookie('nome', nome);
            }
            setCookie('email', email);
            setCookie('senha', senha);
            Swal({
                title: `Login realizado com sucesso`,
                icon: 'success',
                buttons: {
                  confirm: 'Ok',
                },
            });
        }
    });

    return logar;
}

const authLogin = async (email, senha) => {
    const logar = new Promise( async (resolve, reject) => {
        try {
        const userCredential = await auth.signInWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        const nome = user.displayName;
        
        if (nome) {
          resolve(nome);
        } else {
          resolve(true);
        }
          
      } catch (error) {
        if (error.code === 'auth/wrong-password') {
          Swal({
            title: 'Senha inválida!',
            icon: 'error',
            buttons: {
              confirm: 'Ok',
            },
          });
          resolve(false);
        } else if (error.code === 'auth/network-request-failed') {
          Swal({
            title: 'Servidor com sobrecarga, tente novamente mais tarde!',
            icon: 'warning',
            buttons: {
              confirm: 'Ok',
            },
          });
          resolve(false);
        } else if (error.code === 'auth/missing-password') {
          Swal({
            title: 'Senha inválida!',
            icon: 'error',
            buttons: {
              confirm: 'Ok',
            },
          });
          resolve(false);
        } else if (error.code === 'auth/invalid-email') {
          Swal({
            title: 'Email inválido!',
            icon: 'error',
            buttons: {
              confirm: 'Ok',
            },
          });
          resolve(false);
        } else if (error.code === 'auth/invalid-credential') {
          Swal({
            title: 'Email ou senha inválidos!',
            icon: 'error',
            buttons: {
              confirm: 'Ok',
            },
          });
          resolve(false);
        } else if (error.code === 'auth/user-disabled') {
          Swal({
            title: 'Sua conta foi desativada por um admin!',
            icon: 'error',
            buttons: {
              confirm: 'Ok',
            },
          });
          resolve(false);
        } else {
          console.error('Erro ao fazer login:', error.message);
          resolve(false);
        }    
      }
      
    });
  
    return logar;
    
};


function validarEmail(email) {
    var emails = /@([a-zA-Z0-9.-]+\.[a-zA-Z]{3,})$/;
    return emails.test(email);
}

const fazerCadastro = (email, senha, confirmarSenha) => {
    const cadastrar = new Promise( async (resolve, reject) => {
        if (senha !== confirmarSenha) {
            Swal({
                title: 'Senhas diferentes!',
                icon: 'error',
                buttons: {
                  confirm: 'Ok',
                },
            });
            resolve(false);
            return;
        }
        const cadastrarEmail = await authCadastro(email, senha);
        if (!cadastrarEmail) {
            Swal({
                title: 'Erro ao cadastrar, tente novamente mais tarde!',
                icon: 'error',
                buttons: {
                  confirm: 'Ok',
                },
              });
              resolve(false);
              return;
        } else {
            // Colecao Cadastro
            await db.collection(ANO)
            .doc("usuarios")
            .collection(email)
            .doc("dados")
            .set({
                email: email,
                senha: senha
            });

            await Swal({
                title: `Cadastro realizado com sucesso`,
                icon: 'success',
                buttons: {
                  confirm: 'Ok',
                },
            });

        }
    });

    return cadastrar;
}


const authCadastro = async (email, senha) => {
    const cadastrar = new Promise( async (resolve, reject) => {
      try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        if (user) {
          resolve(true);
        }
  
        console.log('Usuário cadastrado com sucesso:', user);
        
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            await Swal({
                title: 'Email já está em uso!',
                icon: 'error',
                buttons: {
                  confirm: 'Ok',
                },
            });
          resolve(error.code);
        } else if (error.code === 'auth/weak-password') {
            await Swal({
                title: 'Senha menor que 6 dígitos!',
                icon: 'error',
                buttons: {
                  confirm: 'Ok',
                },
            });
            resolve(error.code);
        }
        console.error('Erro ao cadastrar usuário:', error.message);
      }
    });
  
    return cadastrar;
  
  };


export { fazerLogin, fazerCadastro }