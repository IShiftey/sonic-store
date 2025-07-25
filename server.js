
require('dotenv').config();
const express = require('express');
const mercadopago = require('mercadopago');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN
});

// Criar pagamento
app.post('/create_preference', async (req, res) => {
    const { email } = req.body;
    let preference = {
        items: [
            {
                title: 'Conta Rockstar',
                unit_price: 0.85,
                quantity: 1
            }
        ],
        payer: { email: email },
        back_urls: {
            success: "http://localhost:3000/sucesso.html",
            failure: "http://localhost:3000/erro.html",
            pending: "http://localhost:3000/pendente.html"
        },
        auto_return: "approved",
        notification_url: "notification_url: "https://sonic-store.onrender.com/webhook"
    };
    try {
        const response = await mercadopago.preferences.create(preference);
        res.json({ init_point: response.body.init_point });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Webhook para confirmar pagamento
app.post('/webhook', async (req, res) => {
    const payment = req.body;
    if (payment.type === 'payment') {
        try {
            const mpResponse = await mercadopago.payment.findById(payment.data.id);
            if (mpResponse.body.status === 'approved') {
                const payerEmail = mpResponse.body.payer.email;
                await enviarProduto(payerEmail);
            }
        } catch (err) {
            console.error('Erro no webhook:', err);
        }
    }
    res.sendStatus(200);
});

// Função para enviar produto
async function enviarProduto(destinatario) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    const arquivo = path.join(__dirname, 'produto.zip');
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: destinatario,
        subject: 'Seu produto da Sonic Store',
        text: 'Obrigado pela compra! Segue em anexo seu produto.',
        attachments: [
            { filename: 'produto.zip', path: arquivo }
        ]
    });
}

// Subir servidor
const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
