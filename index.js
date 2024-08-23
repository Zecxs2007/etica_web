import express from 'express';
import admin from 'firebase-admin';


//REST API http://api.clientes-contigencia.com/info para chamar
const app = express();

admin.initializeApp({
  credential: admin.credential.cert("serviceAccountKey.json")
});

// GET http://api.clientes-contigencia.com/info para recuperar dados
app.get('/dados', (request, response) => {
    console.log('GET dados');
    admin.firestore()
        .collection('CLIENTES')
        .get()
        .then(snapshot => {
            const dados = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id
            }))
            response.json(dados);
        })
})

// GET http://api.clientes-contigencia.com/info/:id para recuperar dados especificos
// POST http://api.clientes-contigencia.com/info para criar dados


// PUT http://api.clientes-contigencia.com/info/:id para atualizar dados
// DELETE http://api.clientes-contigencia.com/info/:id para remover dados

app.listen(3000, () => console.log('API rest foi iniciada em http://localhost:3000'))