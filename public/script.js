const firebaseConfig = {
  apiKey: "AIzaSyAQ_fwNc2BxHcu_DGHL_csfdFdltUeXiyI",
  authDomain: "clientes-contingencia.firebaseapp.com",
  projectId: "clientes-contingencia",
  storageBucket: "clientes-contingencia.appspot.com",
  messagingSenderId: "976322772646",
  appId: "1:976322772646:web:cde53f1227a0097d353e67",
  measurementId: "G-KVJ259WNH5"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let lNOME = document.getElementById("idNOME");
let lCNPJ = document.getElementById("idCNPJ");
let lCUPONS = document.getElementById("idCUPONS");
let lDATA = document.getElementById("idDIA");
let lHORA = document.getElementById("idHORA");


db.collection("CLIENTES").get().then((querySnapshot) => {
  querySnapshot.docs.forEach((doc) => {
    const NOME = doc.data().NOME;
    const CNPJ = doc.data().CNPJ_CPF;
    const CUPONS = doc.data().CUPONS_ACUMULADOS;
    let DIA = doc.data().lastUpdated;
    let HORA = doc.data().lastUpdated;
    console.log(`NOME: ${NOME} CNPJ: ${CNPJ} CUPONS: ${CUPONS} DIA: ${DIA} HORA: ${HORA}`);
  });
});

