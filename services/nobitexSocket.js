import { Centrifuge } from 'centrifuge';

const client = new Centrifuge('wss://wss.nobitex.ir/connection/websocket', {});
client.on('connected', (ctx) => {
    console.log('connected', ctx);
});
client.connect();