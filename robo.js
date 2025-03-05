const wppconnect = require('@wppconnect-team/wppconnect');
const firebaseadmin = require("firebase-admin");

const firebaseServiceAccount = require('./yourcredentialsfile.json');
firebaseadmin.initializeApp({
    credential: firebaseadmin.credential.cert(firebaseServiceAccount)
});
const db = firebaseadmin.firestore();


var userStages = [];

wppconnect.create({
    session: 'whatsbot',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] }
})
    .then((client) =>
        client.onMessage((message) => {
            console.log('Mensagem recebida: ' + message.body);
            stages(client, message);
        }))
    .catch((error) =>
        console.log(error));

function stages(client, message) {
    // Ignorar mensagens de grupos
    if (message.isGroupMsg) {
        return;
    }

    // Verifica se a mensagem contém a palavra "pedido" para iniciar o atendimento
    if (!message.body.toLowerCase().includes("pedido") && !userStages[message.from]) {
        return; // Ignora mensagens que não contenham "pedido" e que não estejam no fluxo
    }

    let stage = userStages[message.from] || 'Olá';

    switch (stage) {
        case 'Nome':
            const nome = message.body;
            sendWppMessage(client, message.from, `Obrigado, ${nome}.`);
            sendWppMessage(client, message.from, 'Digite seu *CPF*:');
            userStages[message.from] = 'CPF';
            break;

        case 'CPF':
            const cpf = message.body;
            sendWppMessage(client, message.from, `Obrigado por informar seu CPF: ${cpf}`);
            sendWppMessage(client, message.from, 'Seu pedido foi registrado. Atendimento finalizado.');
            userStages[message.from] = 'Fim';
            break;

        case 'Fim':
            sendWppMessage(client, message.from, 'Seu atendimento já foi finalizado. Caso precise de algo, envie "pedido" novamente.');
            break;

        default: // Olá - Início do atendimento
            console.log('*Usuário atual* from: ' + message.from);
            sendWppMessage(client, message.from, 'Bem-vindo ao Robô de Whatsapp do AppBasicão!');
            sendWppMessage(client, message.from, 'Digite seu *NOME*:');
            userStages[message.from] = 'Nome';
    }
}

function sendWppMessage(client, sendTo, text) {
    client
        .sendText(sendTo, text)
        .then(() => {
            console.log('Mensagem enviada para:', sendTo);
        })
        .catch((erro) => {
            console.error('Erro ao enviar mensagem:', erro);
        });
}


