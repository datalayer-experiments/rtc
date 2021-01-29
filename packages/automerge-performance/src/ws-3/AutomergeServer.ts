import WebSocket from 'ws'

import Automerge, { Text } from 'automerge'

const http = require('http')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1

export const docs = new Map<string, WSSharedDoc>()

type String = {
  value: Text
}

const broadcastChanges = (conn, doc: WSSharedDoc, changes: Uint8Array[]) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    onClose(doc, conn, null)
  }
  try {
    console.log('--- Broadcast Changes', changes)
    changes.map(change => conn.send(change, err => { err != null && onClose(doc, conn, err) }))    
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
  const change = new Uint8Array(message)
  console.log('--- Change', change)
  sharedDoc.doc = Automerge.applyChanges(sharedDoc.doc, [change])
  console.log('--- Doc Value', sharedDoc.doc.value.toString())
  sharedDoc.conns.forEach((_, conn) => {
    if (currentConn != conn ) {
      broadcastChanges(conn, sharedDoc, [change])
    }
  })
}

export const getSharedDoc = (docName: string): WSSharedDoc => {
  const k = docs.get(docName)
  if (k) {
    return k
  }
  let doc = Automerge.init<String>()
  doc = Automerge.change(doc, s => {
    s.value = new Text()
    s.value.insertAt(0, ...'hello string')
    s.value.deleteAt(0, 1)
    s.value.insertAt(0, 'H')
  })
  const sharedDoc = new WSSharedDoc(doc)
  docs.set(docName, sharedDoc)
  return sharedDoc
}

const onClose = (conn, doc: WSSharedDoc, err) => {
  console.log('Closing WS', err)
  if (doc.conns.has(conn)) {
    doc.conns.delete(conn)
  }
  conn.close()
}

const setupWSConnection = (conn, req, { 
  docName = req.url.slice(1).split('?')[0] as string
} = {}) => {
  console.log('Setup WS Connection', docName)
  conn.binaryType = 'arraybuffer'
  const sharedDoc = getSharedDoc(docName)
  const changes = Automerge.getChanges(Automerge.init<String>(), sharedDoc.doc)
  broadcastChanges(conn, sharedDoc, changes);
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
