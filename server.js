const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer, WebSocket } = require('ws');
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const rooms = new Map();
let nextId = 1;
const server = http.createServer((req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (pathname === '/health') { res.writeHead(200, {'content-type':'text/plain'}); return res.end('ok'); }
  if (pathname !== '/' && pathname !== '/index.html') { res.writeHead(404); return res.end('Not found'); }
  fs.readFile(path.join(ROOT, 'index.html'), (err, data) => {
    if (err) { res.writeHead(500); return res.end('Game file missing'); }
    res.writeHead(200, {'content-type':'text/html; charset=utf-8', 'cache-control':'no-store'}); res.end(data);
  });
});
const wss = new WebSocketServer({ noServer: true });
server.on('upgrade', (req, socket, head) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname !== '/ws') { socket.destroy(); return; }
  wss.handleUpgrade(req, socket, head, ws => wss.emit('connection', ws, req));
});
function send(ws, data) { if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(data)); }
function broadcast(room, data, except) { for (const c of room.clients) if (c !== except) send(c, data); }
wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const roomId = (url.searchParams.get('room') || 'flight').replace(/[^a-zA-Z0-9_-]/g, '').slice(0,32) || 'flight';
  if (!rooms.has(roomId)) rooms.set(roomId, { clients: new Set() });
  const room = rooms.get(roomId); const joinSlot = room.clients.size; ws.id = `p${String(nextId++).padStart(6,'0')}`; ws.roomId = roomId; ws.presence = {};
  room.clients.add(ws);
  send(ws, { type:'welcome', id:ws.id, room:roomId, slot:joinSlot });
  send(ws, { type:'snapshot', peers:[...room.clients].filter(c=>c!==ws).map(c=>({id:c.id,presence:c.presence})) });
  broadcast(room, {type:'peer', action:'joined', id:ws.id, presence:ws.presence}, ws);
  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw.toString()); } catch { return; }
    if (msg.type !== 'presence' || !msg.presence || typeof msg.presence !== 'object') return;
    // Presence is game state only; don't allow arbitrary large payloads.
    const text = JSON.stringify(msg.presence); if (text.length > 30000) return;
    ws.presence = msg.presence;
    broadcast(room, {type:'presence', id:ws.id, presence:ws.presence}, ws);
  });
  ws.on('close', () => {
    room.clients.delete(ws); broadcast(room, {type:'peer', action:'left', id:ws.id});
    if (!room.clients.size) rooms.delete(roomId);
  });
  ws.on('error', () => {});
});
server.listen(PORT, '0.0.0.0', () => console.log(`Japan Air Panic server listening on ${PORT}`));
