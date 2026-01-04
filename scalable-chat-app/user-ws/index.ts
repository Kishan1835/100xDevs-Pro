import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

interface Room {
    sockets: WebSocket[]
}
const rooms: Record<string, Room> = {

}

wss.on('connection', function connection(ws) {
    ws.on('error', console.error);

    ws.on('message', function message(data: string) {
        const parseData = JSON.parse(data);
        if (parseData.type == "join-room") {
            const room = parseData.room;
            if (!rooms[room]) {
                rooms[room] = {
                    sockets: []
                }
            }
            rooms[room].sockets.push(ws);
        }
        if (parseData.type == "chat") {
            const room = parseData.room;

            rooms[room]?.sockets.map(socket => socket.send(data))
        }
        console.log('received: %s', data);
    });

    ws.send('something');
});