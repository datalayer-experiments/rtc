import * as WebSocket from "ws";
import { Server } from "ws";

/*
 * This interface defines the group of definitions
 * that the rtc sever will use in order to talk
 * with other clients.
 */
interface rtcserverValues {
  HOST: string;
  PORT: number;
}

export { rtcserverValues };

/*
 * Globally available express server and websocket server
 * so that we can easily share the comms pattern between
 * different widgets in the ecosystem
 */
interface rtcServer {
  wss: Server;
}

export { rtcServer };

const conf: rtcserverValues = {
  HOST: "0.0.0.0",
  PORT: 4400,
};

const wss = new WebSocket.Server({ port: conf.PORT });
console.log(`Websocket Server is running at ws://localhost:${conf.PORT}`);

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(data) {
    console.log('Sending', data);
    wss.clients.forEach(function each(client) {
//    	console.log('Sending', data, ' to ', client);
    	client.send(data);
    });
    ws.send(data);
  });
});
