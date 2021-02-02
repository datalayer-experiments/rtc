import WebSocket from 'ws'

const http = require('http')

import { IncomingMessage } from 'http'

const wsReadyStateConnecting = 0

const wsReadyStateOpen = 1

import Automerge, { Text } from 'automerge'

export const docs = new Map<string, AMSharedDoc>()

export type AmDoc = {
  [key: string]: any
};

const broadcastChanges = (conn, doc: AMSharedDoc, changes: Uint8Array[]) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    onClose(doc, conn, null)
  }
  try {
    // Get the total length of all arrays.
    let length = 0;
    changes.forEach(item => {
      length += item.length;
    });
    // Create a new array with total length and merge all source arrays.
    let combined = new Uint8Array(length);
    let offset = 0;
    changes.forEach(item => {
      combined.set(item, offset);
      offset += item.length;
    });
    conn.send(combined, err => { err != null && onClose(doc, conn, err) })  
  } catch (e) {
    onClose(doc, conn, e)
  }
}

class AMSharedDoc {
  private name = null;
  public doc: AmDoc = null;
  public conns = new Map()
  constructor(doc: AmDoc) {
    this.doc = doc;
  }
}

const onMessage = (currentConn, docName, sharedDoc: AMSharedDoc, message: any) => {
  const change = new Uint8Array(message)
  sharedDoc.doc = Automerge.applyChanges(sharedDoc.doc, [change])
  sharedDoc.conns.forEach((_, conn) => {
    if (currentConn != conn ) {
      broadcastChanges(conn, sharedDoc, [change])
    }
  })
}

export const getAmSharedDoc = (uuid: string, docName: string): AMSharedDoc => {
  let k = docs.get(docName)
  if (k) {
   return k
  }
  let doc = Automerge.init<AmDoc>({ actorId: uuid})
  doc = Automerge.change(doc, d => {
    const t = new Text()
    t.insertAt(0, ...'Initial content loaded from Server.')
    d['value'] = t
  })
  const sharedDoc = new AMSharedDoc(doc)
  docs.set(docName, sharedDoc)
  return sharedDoc
}

const onClose = (conn, doc: AMSharedDoc, err) => {
  console.log('Closing WS', err)
  if (doc.conns.has(conn)) {
    doc.conns.delete(conn)
  }
  conn.close()
}

const setupWSConnection = (conn, req: IncomingMessage) => {
  const urlPath = req.url.slice(1).split('?')[0]
  const uuid = urlPath.split('/')[0]
  const docName = urlPath.split('/')[1]
  console.log('Setup WS Connection', uuid, docName)
  conn.binaryType = 'arraybuffer'
  const sharedDoc = getAmSharedDoc(uuid, docName)
  const changes = Automerge.getChanges(Automerge.init<AmDoc>(), sharedDoc.doc)
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
