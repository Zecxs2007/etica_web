import axios from 'axios';

// Função para chamar a API de atualização de cupons
const atualizarCupons = async () => {
    try {
        const response = await axios.get('http://localhost:7584/atualizar-cupons');
        console.log(response.data);
    } catch (error) {
        console.error('Erro ao atualizar cupons:', error.message);
    }
};

// Define o intervalo de tempo (em milissegundos) para o loop
const intervalo = 60000; // 60 segundos (1 minuto)

// Executa a função inicialmente
atualizarCupons();

// Coloca a função para rodar em loop, repetindo a cada 'intervalo'
setInterval(atualizarCupons, intervalo);
