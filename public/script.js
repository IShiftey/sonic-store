
async function comprar() {
    const email = document.getElementById('email').value;
    if (!email) {
        alert('Digite seu e-mail para continuar!');
        return;
    }
    const response = await fetch('/create_preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
    });
    const data = await response.json();
    if (data.init_point) {
        window.location.href = data.init_point;
    } else {
        alert('Erro ao iniciar pagamento.');
    }
}
