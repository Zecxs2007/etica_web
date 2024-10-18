let dadosClientes = []; // Variável global para armazenar os dados dos clientes

async function fetchDados() {
    try {
        const response = await fetch('http://localhost:3000/dados');

        if (!response.ok) {
            throw new Error('Erro na rede ao buscar os dados');
        }

        const data = await response.json();
        console.log('Dados recebidos do servidor:', data);
        dadosClientes = data; // Armazena os dados recebidos na variável global
        return dadosClientes;
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
        return []; // Retorna um array vazio em caso de erro
    }
}

function atualizarTabela() {
    fetchDados().then(data => {
        const tabelaClientes = document.getElementById('tabela-clientes');
        tabelaClientes.innerHTML = ''; // Limpa o tbody

        if (data && data.length > 0) { // Verifica se há dados para mostrar
            // Itera sobre o array de dados
            data.forEach(cliente => {
                const cnpj = cliente.CNPJ;
                const nome = cliente.NOME;
                const quantidadeCupons = cliente.QUANTIDADECUPONS;
                const dataHora = new Date(cliente.DATAHORA).toLocaleString();

                const novaLinha = document.createElement('tr');
                novaLinha.innerHTML = `
                    <td>${cnpj}</td>
                    <td>${nome}</td>
                    <td>${quantidadeCupons}</td>
                    <td>${dataHora}</td>
                `;

                tabelaClientes.appendChild(novaLinha); // Adiciona a nova linha à tabela
            });
        } else {
            console.warn('Nenhum dado recebido ou dados vazios.');
        }
    });
}

// Adiciona o evento ao botão de atualização
document.getElementById('btn-atualizar').addEventListener('click', atualizarTabela);
