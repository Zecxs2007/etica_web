let lastSortedColumn = -1; // Para armazenar a última coluna ordenada
let isAscending = true; // Para alternar entre crescente e decrescente

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

function sortTableByColumn(index, headerElement) {
    const tabela = document.querySelector('table');
    const rows = Array.from(tabela.querySelectorAll('tbody tr'));
    
    const isNumeric = index === 2; // Apenas a coluna de "Quantidade de Cupons" é numérica

    // Ordena os dados
    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[index].innerText.trim();
        const cellB = rowB.children[index].innerText.trim();

        if (isNumeric) {
            // Para a coluna de "Quantidade de Cupons", converte para número
            const numA = parseInt(cellA, 10);
            const numB = parseInt(cellB, 10);

            return isAscending ? numA - numB : numB - numA;
        } else {
            // Para texto, compara diretamente
            return isAscending
                ? cellA.localeCompare(cellB)
                : cellB.localeCompare(cellA);
        }
    });

    // Atualiza a ordem na tabela
    rows.forEach(row => tabela.querySelector('tbody').appendChild(row));

    // Alterna a direção da ordenação
    isAscending = (lastSortedColumn === index) ? !isAscending : true;
    lastSortedColumn = index;

    // Remove as classes de ordenação anteriores
    document.querySelectorAll('th').forEach(th => th.classList.remove('ascending', 'descending'));

    // Marca a direção da coluna atual
    headerElement.classList.add(isAscending ? 'ascending' : 'descending');
}

// Adiciona eventos de clique para ordenar as colunas
document.querySelectorAll('th').forEach((th, index) => {
    th.dataset.index = index; // Adiciona o índice de cada coluna para facilitar a ordenação
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
