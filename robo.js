const wppconnect = require('@wppconnect-team/wppconnect');

wppconnect.create({
    session: 'whatsbot',
    autoClose: false,
    puppeteerOptions: { args: ['--no-sandbox'] }
})
    .then((client) =>
        client.onMessage((message) => {
            console.log(message.body);
            sendWppMessage(client, message.from, 'Bem vindo ao Robô de Whatsapp do AppBasicão!');
            sendWppMessage(client, message.from, 'Digite seu *NOME*:');
        }))
    .catch((error) =>
        console.log(error));


function sendWppMessage(client, sendTo, text) {
    client.sendText(sendTo, text)
        .then((result) => {
            // console.log('SUCESSO: ', result); 
        })
        .catch((erro) => {
            console.error('ERRO: ', erro);
        });
}