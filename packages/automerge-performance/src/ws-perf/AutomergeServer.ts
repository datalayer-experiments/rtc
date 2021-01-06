import WebSocket from 'ws'

import Automerge, { Text } from 'automerge-wasm-node'

// const CodecFunctions = require('automerge-wasm-node/backend/columnar')
// import wasmBackend from 'automerge-backend-wasm-nodejs'
// wasmBackend.initCodecFunctions(CodecFunctions)
// Automerge.setDefaultBackend(wasmBackend)

const http = require('http')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1

export const docs = new Map()

export type Doc = {
  docId: string;
  textArea: Text;
};

const send = (conn, doc: WSSharedDoc, changes) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    onClose(doc, conn, null)
  }
  try {
    // console.log(changes[0])
    console.log(JSON.stringify(changes[0]))

    conn.send(changes[0], err => { err != null && onClose(doc, conn, err) })
  } catch (e) {
    onClose(doc, conn, e)
  }
}

class WSSharedDoc {
  private name = null;
  public doc = null;
  public conns = new Map()
  constructor(doc: Doc) {
    this.doc = doc;
    this.name = doc.docId;
  }
}

const onMessage = (conn, doc: WSSharedDoc, message) => {
  const m = message
  console.log(JSON.stringify(m))
  doc.conns.forEach((_, conn) => send(conn, doc, [m]))
}

export const getSharedDoc = (docName) => {
  const k = docs.get(docName);
  if (k) {
    return k;
  }
  const d = Automerge.init<Doc>()
  const doc1 = Automerge.change(d, doc => {
    doc.docId = docName;
    doc.textArea = new Automerge.Text();
    doc.textArea.insertAt(0, 'h', 'e', 'l', 'l', 'o')
    doc.textArea.deleteAt(0)
    doc.textArea.insertAt(0, 'H')
  })
  const sharedDoc = new WSSharedDoc(doc1)
  docs.set(docName, sharedDoc)
  return sharedDoc
}

const onClose = (conn, doc: WSSharedDoc, err) => {
  console.log('Closing', err)
  if (doc.conns.has(conn)) {
    doc.conns.delete(conn)
  }
  conn.close()
}

const setupWSConnection = (conn, req, { docName = req.url.slice(1).split('?')[0], gc = true } = {}) => {
  conn.binaryType = 'arraybuffer'
  const sharedDoc: WSSharedDoc = getSharedDoc(docName)
  sharedDoc.conns.set(conn, new Set())
  conn.on('message', message => onMessage(conn, sharedDoc, message))
  conn.on('close', err => onClose(conn, sharedDoc, err))
  const changes = Automerge.getAllChanges(sharedDoc.doc)
  send(conn, sharedDoc, changes)
}

const PORT = process.env.PORT || 4321
const wss = new WebSocket.Server({ noServer: true })

const server = http.createServer((request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/plain' })
  response.end('okay')
})

wss.on('connection', setupWSConnection)

server.on('upgrade', (request, socket, head) => {
  const handleAuth = ws => {
    wss.emit('connection', ws, request)
  }
  wss.handleUpgrade(request, socket, head, handleAuth)
})

server.listen(PORT)

console.log('WebSocket server running on port', PORT)
