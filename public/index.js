function logar(event) {
    event.preventDefault(); // Previne a submissão do formulário

    let nome = document.getElementById('nome').value;
    let senha = document.getElementById('senha').value;

    if (nome === 'admin' && senha === '2024etica2024') {
        alert('Logado com sucesso!');
        window.location.href = "lista.html"
    } else {
        alert('Nome de usuário ou senha incorretos. Tente novamente.');
    }
}
