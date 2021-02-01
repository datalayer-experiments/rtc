import WebSocket from 'ws'

const http = require('http')

import { IncomingMessage } from 'http'

const wsReadyStateConnecting = 0

const wsReadyStateOpen = 1

import Automerge, { Text } from 'automerge'

export const docs = new Map<string, WSSharedDoc>()
/*
type Cursors = {
  [uuid: string]: Automerge.Cursor
}
*/
export type AMSelections = {
  [uuid: string]: any
};

export type AMModel = {
  text: Text;
//  cursors: Cursors;
  selections: AMSelections;
};

const broadcastChanges = (conn, doc: WSSharedDoc, changes: Uint8Array[]) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    onClose(doc, conn, null)
  }
  try {
//    changes.map(change => conn.send(change, err => { err != null && onClose(doc, conn, err) }))    
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
//    console.log('--- Broadcast Changes:', combined)
    conn.send(combined, err => { err != null && onClose(doc, conn, err) })  
  } catch (e) {
    onClose(doc, conn, e)
  }
}

class WSSharedDoc {
  private name = null;
  public doc: AMModel = null;
  public conns = new Map()
  constructor(doc: AMModel) {
    this.doc = doc;
  }
}

const onMessage = (currentConn, docName, sharedDoc: WSSharedDoc, message: any) => {
  const change = new Uint8Array(message)
//  console.log('--- Received Change:', change)
  sharedDoc.doc = Automerge.applyChanges(sharedDoc.doc, [change])
//  console.log('--- Current Value:', sharedDoc.doc.text.toString())
//  console.log('--- Current Cursors:', sharedDoc.doc.cursors)
//  console.log('--- Current Selections', sharedDoc.doc.selections)
  sharedDoc.conns.forEach((_, conn) => {
    if (currentConn != conn ) {
      broadcastChanges(conn, sharedDoc, [change])
    }
  })
}

export const getSharedDoc = (uuid: string, docName: string): WSSharedDoc => {
  let k = docs.get(docName)
  if (k) {
   return k
  }
  let doc = Automerge.init<AMModel>({ actorId: uuid})
  doc = Automerge.change(doc, s => {
    s.text = new Text()
    const t = 'Initial content loaded from Server.'
    s.text.insertAt(0, ...t)
//    s.cursors = {}
//    s.cursors[uuid] = s.text.getCursorAt(s.text.toString().length - 1)
//    s.selections = {}
//    s.selections[uuid] = 'hello selections'
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

const setupWSConnection = (conn, req: IncomingMessage) => {
  const urlPath = req.url.slice(1).split('?')[0]
  const uuid = urlPath.split('/')[0]
  const docName = urlPath.split('/')[1]
  console.log('Setup WS Connection', uuid, docName)
  conn.binaryType = 'arraybuffer'
  const sharedDoc = getSharedDoc(uuid, docName)
  const changes = Automerge.getChanges(Automerge.init<AMModel>(), sharedDoc.doc)
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
