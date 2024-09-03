function logar(event) {
    event.preventDefault(); // Previne a submissão do formulário

    let nome = document.getElementById('nome').value; // Corrigi o ID aqui
    let senha = document.getElementById('senha').value;

    if (nome === 'admin' && senha === '2024etica2024') {
        alert('Logado com sucesso!');
        // Redirecione o usuário para outra página, se desejar
        // window.location.href = "pagina_protegida.html";
    } else {
        alert('Nome de usuário ou senha incorretos. Tente novamente.');
    }
}
