/**
 CONEXÃO COM O BANCO DE DADOS

 const firebaseadmin = require("firebase-admin");
 
 const firebaseServiceAccount = require('./suacredencial.json');
 firebaseadmin.initializeApp({
     credential: firebaseadmin.credential.cert(firebaseServiceAccount)
 });
 const db = firebaseadmin.firestore();
 */


const wppconnect = require('@wppconnect-team/wppconnect');

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

    let stage = userStages[message.from] || 'Olá sou o bot do Warleyson';

    switch (stage) {
        case 'Nome':
            const nome = message.body;
            sendWppMessage(client, message.from, `Obrigado, ${nome}.`);
            sendWppMessage(client, message.from, 'Digite seu *Apelido*:');
            userStages[message.from] = 'Apelido';
            break;

        case 'Apelido':
            const cpf = message.body;
            sendWppMessage(client, message.from, `Agora que somos intimos, vou te chamar de: ${cpf}`);
            sendWppMessage(client, message.from, 'Agora me diga o que quer pedir hoje.');
            userStages[message.from] = 'Pedido';
            break;

        case 'Pedido':
            const pedido = message.body;
            sendWppMessage(client, message.from, `Ok, você acaba de pedir por: ${pedido}`);
            sendWppMessage(client, message.from, 'Seu pedido foi registrado. Atendimento finalizado.');
            userStages[message.from] = 'Fim';
                break;

        case 'Fim':
            sendWppMessage(client, message.from, 'Seu atendimento já foi finalizado. Caso precise de algo, envie "pedido" novamente.');
            break;

        default: // Olá - Início do atendimento
            console.log('*Usuário atual* from: ' + message.from);
            saveUser(message);
            sendWppMessage(client, message.from, 'Bem-vindo ao teste do bot do whatsapp do *Warleyson*!');
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

async function saveUser(message) {
    let user = {
        'pushname': (message['sender']['pushname'] != undefined) ? message['sender']['pushname'] : '',
        'whatsapp': (message.from).replace(/[^\d]+/g, '')
    }
    let newUser = await db.collection('clientes').add(user);
    return newUser;
}


