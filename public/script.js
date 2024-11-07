// Função principal para buscar e atualizar os dados
async function main() {
    try {
        const response = await fetch('http://38.114.119.39:9834/dados');
        const dados = await response.json();
        
        // Armazenar os dados no localStorage
        localStorage.setItem('dadosClientes', JSON.stringify(dados));
        
        atualizarTabela(dados);
    } catch (error) {
        console.error('Erro ao buscar os dados:', error);
    }
}

// Função para formatar a data e hora
function formatarDataHora(dataHoraISO) {
    const data = new Date(dataHoraISO);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano} ${horas}:${minutos}`;
}

// Função para atualizar a tabela com os dados recebidos ou armazenados
function atualizarTabela(dados) {
    const tabelaClientes = document.getElementById('tabela-clientes');
    tabelaClientes.innerHTML = ''; // Limpa a tabela antes de inserir novos dados

    dados.forEach(cliente => {
        const row = document.createElement('tr');

        // Chama a função formatarDataHora para exibir a data e hora de forma mais amigável
        const dataHoraFormatada = formatarDataHora(cliente.DATAHORA);

        row.innerHTML = `
            <td>${cliente.CNPJ}</td>
            <td>${cliente.NOME}</td>
            <td>${cliente.QUANTIDADECUPONS}</td>
            <td>${dataHoraFormatada}</td>
        `;

        tabelaClientes.appendChild(row);
    });
}

// Função de busca filtrada
function filtrarTabela() {
    const searchValue = document.getElementById('search-input').value.toLowerCase();
    const searchCategory = document.getElementById('search-category').value;
    
    const tabelaClientes = document.getElementById('tabela-clientes');
    const rows = tabelaClientes.querySelectorAll('tr');

    rows.forEach(row => {
        const columnIndex = searchCategory === 'CNPJ' ? 0 
                         : searchCategory === 'Nome' ? 1 
                         : 2; // Índice da coluna baseado na categoria selecionada

        const cellValue = row.children[columnIndex].innerText.toLowerCase();
        row.style.display = cellValue.includes(searchValue) ? '' : 'none';
    });
}

// Adiciona eventos de clique para ordenar as colunas
document.querySelectorAll('th').forEach((th, index) => {
    th.addEventListener('click', () => sortTableByColumn(index, th));
});

// Adiciona o evento para o campo de busca
document.getElementById('search-input').addEventListener('input', filtrarTabela);

// Tenta carregar os dados do localStorage ao carregar a página
window.addEventListener('load', () => {
    const dadosArmazenados = localStorage.getItem('dadosClientes');
    if (dadosArmazenados) {
        const dados = JSON.parse(dadosArmazenados);
        atualizarTabela(dados);
    } else {
        // Se não houver dados no localStorage, chama a função principal para buscar os dados
        main();
    }
});
