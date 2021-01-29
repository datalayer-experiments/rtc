import WebSocket from 'ws'

import Automerge, { Text } from 'automerge'
const http = require('http')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1

export const docs = new Map<string, WSSharedDoc>()

type String = {
  t: Text
}

const send = (conn, doc: WSSharedDoc, message: any) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    onClose(doc, conn, null)
  }
//  conn.send(message, err => { err != null && onClose(doc, conn, err) })      
  try {
      conn.send(JSON.stringify(message), err => { err != null && onClose(doc, conn, err) })
  } catch (e) {
    onClose(doc, conn, e)
  }
}

class WSSharedDoc {
  private name = null;
  public doc: String = null;
  public conns = new Map()
  constructor(doc: String) {
    this.doc = doc;
  }
}

const onMessage = (currentConn, docName, sharedDoc: WSSharedDoc, message: any) => {
  const j = JSON.parse(message)
  console.log('222', j)
  const changes = j.changes;
  console.log('333', changes)
  sharedDoc.doc = Automerge.applyChanges(sharedDoc.doc, changes)
  sharedDoc.conns.forEach((_, conn) => {
    if (currentConn != conn ) {
      send(conn, sharedDoc, message)
    }
  })
}

export const getSharedDoc = (docName: string): WSSharedDoc => {
  const k = docs.get(docName)
  if (k) {
    return k
  }
  const d1 = Automerge.init<String>()
  const d2 = Automerge.change(d1, doc => {
    doc.t = new Automerge.Text();
    doc.t.insertAt(0, ...'hello')
    doc.t.deleteAt(0)
    doc.t.insertAt(0, 'H')
  })
  const sharedDoc = new WSSharedDoc(d2)
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

const setupWSConnection = (conn, req, { docName = req.url.slice(1).split('?')[0] as string} = {}) => {
//  conn.binaryType = 'arraybuffer'
  const sharedDoc = getSharedDoc(docName)
  const changes = Automerge.getChanges(Automerge.init<String>(), sharedDoc.doc)
  send(conn, sharedDoc, {
    action: 'changes',
    changes: changes
  });
  sharedDoc.conns.set(conn, new Set())
  conn.on('message', message => onMessage(conn, docName, sharedDoc, message))
  conn.on('close', err => onClose(conn, sharedDoc, err))
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
