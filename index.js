import express from 'express';
import admin from 'firebase-admin';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

admin.initializeApp({
    credential: admin.credential.cert("serviceAccountKey.json")
});

const firestore = admin.firestore();

// Serve arquivos estáticos da pasta 'public'
app.use(express.static(join(__dirname, 'public')));

app.get('/cliente', async (req, res) => {
    const cnpjQuery = req.query.cnpj;
    const nomeQuery = req.query.nome;
    let dados;

    if (cnpjQuery) {
        // Filtra os dados pelo CNPJ parcialmente
        dados = (await firestore.collection('CLIENTES')
            .where('CNPJ_CPF', '>=', cnpjQuery)
            .where('CNPJ_CPF', '<=', cnpjQuery + '\uf8ff')
            .get()).docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));
    } else if (nomeQuery) {
        // Filtra os dados pelo nome parcialmente
        dados = (await firestore.collection('CLIENTES')
            .where('NOME', '>=', nomeQuery)
            .where('NOME', '<=', nomeQuery + '\uf8ff')
            .get()).docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));
    } else {
        // Obtém todos os dados se nenhum CNPJ ou nome for pesquisado
        dados = (await firestore.collection('CLIENTES').get()).docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));
    }

    const data = JSON.stringify(dados);

    const response = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pesquisa por CNPJ ou Nome</title>
        <link rel="stylesheet" href="/style.css">
        <script>
            let data = ${data};
            let sortDirection = {};

            function sortTable(column, type) {
                if (!sortDirection[column]) {
                    sortDirection[column] = 'asc';
                } else {
                    sortDirection[column] = sortDirection[column] === 'asc' ? 'desc' : 'asc';
                }

                data.sort((a, b) => {
                    let valA = a[column];
                    let valB = b[column];

                    if (type === 'number') {
                        valA = Number(valA) || 0;
                        valB = Number(valB) || 0;
                    } else if (type === 'date') {
                        valA = new Date(valA.seconds * 1000);
                        valB = new Date(valB.seconds * 1000);
                    } else {
                        valA = valA.toString().toLowerCase();
                        valB = valB.toString().toLowerCase();
                    }

                    if (valA < valB) return sortDirection[column] === 'asc' ? -1 : 1;
                    if (valA > valB) return sortDirection[column] === 'asc' ? 1 : -1;
                    return 0;
                });

                renderTable();
            }

            function renderTable() {
                const tbody = document.querySelector('tbody');
                tbody.innerHTML = data.map(doc => \`
                    <tr>
                        <td>\${doc.ID}</td>
                        <td>\${doc.NOME}</td>
                        <td>\${doc.CNPJ_CPF}</td>
                        <td>\${doc.CUPONS_ACUMULADOS}</td>
                        <td>\${new Date(doc.lastUpdated.seconds * 1000).toLocaleDateString()}</td>
                        <td>\${new Date(doc.lastUpdated.seconds * 1000).toLocaleTimeString()}</td>
                    </tr>\`).join('');
            }

            window.onload = renderTable;
        </script>
    </head>
    <body>
        <div id="label">
            <form action="/cliente" method="get">
                <label for="cnpj">Pesquisar por CNPJ:</label>
                <input type="text" id="cnpj" name="cnpj" placeholder="Digite o CNPJ">
                <br>
                <label for="nome">Pesquisar por Nome:</label>
                <input type="text" id="nome" name="nome" placeholder="Digite o Nome">
                <br>
                <button type="submit">Pesquisar</button>
            </form>
            <table>
                <thead>
                    <tr>
                        <th onclick="sortTable('ID', 'number')">Id</th>
                        <th onclick="sortTable('NOME', 'string')">Nome</th>
                        <th onclick="sortTable('CNPJ_CPF', 'string')">CNPJ</th>
                        <th onclick="sortTable('CUPONS_ACUMULADOS', 'number')">Cupons</th>
                        <th onclick="sortTable('lastUpdated', 'date')">Data Última atualização</th>
                        <th onclick="sortTable('lastUpdated', 'date')">Hora atualização</th>
                    </tr>
                </thead>
                <tbody>
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `;
    
    res.send(response);
});

app.listen(3000, () => console.log('API rest foi iniciada em http://localhost:3000'));
