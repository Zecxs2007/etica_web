// Configuração do Firebase
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

const tableBody = document.getElementById("table-body");
const toggleThemeButton = document.getElementById("toggle-theme");

// Função para carregar e atualizar dados
function carregarDados() {
  db.collection("CLIENTES").get().then((querySnapshot) => {
    tableBody.innerHTML = ''; // Limpa o conteúdo atual
    querySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      const NOME = data.NOME;
      const CNPJ = data.CNPJ_CPF;
      const CUPONS = data.CUPONS_ACUMULADOS ? data.CUPONS_ACUMULADOS : 'Sem Cupons';
      const lastUpdated = data.lastUpdated;
      const DIA = lastUpdated ? lastUpdated.toDate().toLocaleDateString() : 'Data não disponível';
      const HORA = lastUpdated ? lastUpdated.toDate().toLocaleTimeString() : 'Hora não disponível';

      const newRow = document.createElement("tr");

      newRow.innerHTML = `
        <td>${NOME}</td>
        <td>${CNPJ}</td>
        <td>${CUPONS}</td>
        <td>${DIA}</td>
        <td>${HORA}</td>
      `;

      tableBody.appendChild(newRow);
    });
  }).catch(error => console.error('Erro ao carregar dados:', error));
}

// Função para alternar entre temas claro e escuro
function alternarTema() {
  const corpo = document.body;
  const icone = document.querySelector('#toggle-theme i');
  
  if (corpo.classList.contains('dark-mode')) {
    corpo.classList.remove('dark-mode');
    icone.classList.remove('fa-moon');
    icone.classList.add('fa-sun');
    localStorage.setItem('tema', 'light');
  } else {
    corpo.classList.add('dark-mode');
    icone.classList.remove('fa-sun');
    icone.classList.add('fa-moon');
    localStorage.setItem('tema', 'dark');
  }
}

// Adiciona um evento de clique ao botão de alternar tema
toggleThemeButton.addEventListener('click', alternarTema);

// Verifica o tema ao carregar a página e aplica o tema salvo no localStorage
function verificarTema() {
  const temaSalvo = localStorage.getItem('tema');
  if (temaSalvo === 'dark') {
    document.body.classList.add('dark-mode');
    toggleThemeButton.querySelector('i').classList.remove('fa-sun');
    toggleThemeButton.querySelector('i').classList.add('fa-moon');
  } else {
    document.body.classList.remove('dark-mode');
    toggleThemeButton.querySelector('i').classList.remove('fa-moon');
    toggleThemeButton.querySelector('i').classList.add('fa-sun');
  }
}

// Salva a configuração do tema no localStorage quando a página é carregada
document.addEventListener('DOMContentLoaded', () => {
  verificarTema();
  carregarDados(); // Carrega os dados ao inicializar a página
  setInterval(carregarDados, 600000); // Atualiza os dados a cada 10 minutos
});
