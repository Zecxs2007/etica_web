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

firebase.auth().onAuthStateChanged((user) => {
  if (!user) {
      // Se o usuário não está autenticado, redireciona para a página de login
      window.location.href = "./LOGIN/login.html";
  }
});

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

let sortDirection = {}; // Para armazenar a direção de ordenação de cada coluna

function ordenarDados(coluna) {
  const rowsArray = Array.from(tableBody.getElementsByTagName('tr'));

  // Determina a direção da ordenação
  if (!sortDirection[coluna]) {
    sortDirection[coluna] = 'asc'; // Ordena ascendente inicialmente
  } else {
    sortDirection[coluna] = sortDirection[coluna] === 'asc' ? 'desc' : 'asc'; // Alterna entre asc e desc
  }

  rowsArray.sort((rowA, rowB) => {
    const cellA = rowA.querySelector(`td:nth-child(${getColumnIndex(coluna)})`).innerText.toLowerCase();
    const cellB = rowB.querySelector(`td:nth-child(${getColumnIndex(coluna)})`).innerText.toLowerCase();

    if (cellA < cellB) {
      return sortDirection[coluna] === 'asc' ? -1 : 1;
    }
    if (cellA > cellB) {
      return sortDirection[coluna] === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Reinsere as linhas ordenadas na tabela
  rowsArray.forEach(row => tableBody.appendChild(row));

  // Atualiza as setas de ordenação
  atualizarSetas(coluna, sortDirection[coluna]);
}

// Função auxiliar para obter o índice da coluna com base no nome da coluna
function getColumnIndex(coluna) {
  const columns = {
    NOME: 1,
    CNPJ_CPF: 2,
    CUPONS: 3,
    DIA: 4,
    HORA: 5
  };
  return columns[coluna];
}

// Função para atualizar as setas de ordenação
function atualizarSetas(coluna, direction) {
  document.querySelectorAll('th').forEach(th => {
    const span = th.querySelector('.sort-indicator');
    th.removeAttribute('data-order'); // Remove a direção de ordenação antiga
    span.innerHTML = ''; // Limpa o ícone antigo
  });

  const activeTh = document.querySelector(`th[data-column="${coluna}"]`);
  activeTh.setAttribute('data-order', direction);
}

// Adiciona eventos de clique aos cabeçalhos para ordenar a tabela
document.querySelectorAll('th[data-column]').forEach(th => {
  th.addEventListener('click', () => {
    const coluna = th.getAttribute('data-column');
    ordenarDados(coluna);
  });
});

// Carrega os dados e aplica o tema ao inicializar a página
document.addEventListener('DOMContentLoaded', () => {
  verificarTema();
  carregarDados(); // Carrega os dados ao inicializar a página
  setInterval(carregarDados, 10000); // Atualiza os dados a cada 10 segundos
});
