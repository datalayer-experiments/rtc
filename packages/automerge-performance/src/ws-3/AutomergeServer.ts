import WebSocket from 'ws'

const http = require('http')

import { IncomingMessage } from 'http'

import Automerge, { Text } from 'automerge'

import { decodeChanges } from 'automerge/backend/columnar';

export const docs = new Map<string, AMSharedDoc>()

export type AmDoc = {
  [key: string]: any
};

const WS_READY_STATE_CONNECTING = 0

const WS_READY_STATE_OPEN = 1

export const combine = (changes: Uint8Array[]) => {
  // Get the total length of all arrays.
  let length = 0;
  changes.forEach(item => {
    length += item.length;
  });
  // Create a new array with total length and merge all source arrays.
  let combined = new Uint8Array(length);
  let offset = 0;
  changes.forEach(change => {
    combined.set(change, offset);
    offset += change.length;
  });
  return combined;
}

export const createLock = () => {
  let lock = true;
  return (a: any, b: any) => {
    if (lock) {
      lock = false;
      try {
        a();
      } finally {
        lock = true;
      }
    } else if (b !== undefined) {
      b();
    }
  };
};

export const lock = createLock()

const broadcastChanges = (conn, doc: AMSharedDoc, changes: Uint8Array[]) => {
  if (conn.readyState !== WS_READY_STATE_CONNECTING && conn.readyState !== WS_READY_STATE_OPEN) {
    onClose(doc, conn, null)
  }
  try {
    const combined = combine(changes)
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
  lock(() => {
    const changes = new Uint8Array(message)
    console.log("Changes", docName, decodeChanges([changes]))
    sharedDoc.doc = Automerge.applyChanges(sharedDoc.doc, [changes])
    console.log("Doc", docName, sharedDoc.doc)
    sharedDoc.conns.forEach((_, conn) => {
      if (currentConn != conn ) {
        broadcastChanges(conn, sharedDoc, [changes])
      }
    })  
  }, () => {})
}

export const getAmSharedDoc = (uuid: string, docName: string, intialize: boolean): AMSharedDoc => {
  let k = docs.get(docName)
  if (k) {
   return k
  }
  let doc = Automerge.init<AmDoc>({ actorId: uuid})
  if (intialize) {
    doc = Automerge.change(doc, d => {
      d['ownerId'] = uuid
      d['value'] = new Text()
      d['value'].insertAt(0, ...'Initial content loaded from Server.')
    })
  }
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
  const params = req.url.slice(1).split('?')[1]
  let initialize = false;
  if (params.indexOf('initialize') > -1) {
    initialize = true
  }
  const uuid = urlPath.split('/')[0]
  const docName = urlPath.split('/')[1]
  console.log('Setup WS Connection', uuid, docName)
  conn.binaryType = 'arraybuffer'
  const sharedDoc = getAmSharedDoc(uuid, docName, initialize)
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
