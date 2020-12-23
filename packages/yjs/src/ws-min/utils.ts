import * as Y from 'yjs';

const syncProtocol = require('y-protocols/dist/sync.cjs')

const encoding = require('lib0/dist/encoding.cjs')
const decoding = require('lib0/dist/decoding.cjs')
const mutex = require('lib0/dist/mutex.cjs')
const map = require('lib0/dist/map.cjs')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1
const messageSync = 0
export const docs = new Map()

const updateHandler = (update, origin, doc) => {
  const encoder = encoding.createEncoder()
  encoding.writeVarUint(encoder, messageSync)
  syncProtocol.writeUpdate(encoder, update)
  const message = encoding.toUint8Array(encoder)
  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

class WSSharedDoc extends Y.Doc {
  private name = null;
  private mux = null;
  private conns = new Map()
  constructor (name) {
    super({ gc: false })
    this.name = name
    this.mux = mutex.createMutex()
    this.on('update', updateHandler)
  }
}

export const getYDoc = (docname) => map.setIfUndefined(docs, docname, () => {
  const doc = new WSSharedDoc(docname)
  docs.set(docname, doc)
  return doc
});

const messageListener = (conn, doc, message) => {
  const encoder = encoding.createEncoder()
  const decoder = decoding.createDecoder(message)
  const messageType = decoding.readVarUint(decoder)
  switch (messageType) {
    case messageSync:
      encoding.writeVarUint(encoder, messageSync)
      syncProtocol.readSyncMessage(decoder, encoder, doc, null)
      if (encoding.length(encoder) > 1) {
        send(doc, conn, encoding.toUint8Array(encoder))
      }
      break
  }
}

const closeConn = (doc, conn) => {
  if (doc.conns.has(conn)) {
    const controlledIds = doc.conns.get(conn)
    doc.conns.delete(conn)
  }
  conn.close()
}

const send = (doc, conn, m) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    closeConn(doc, conn)
  }
  try {
    conn.send(m, err => { err != null && closeConn(doc, conn) })
  } catch (e) {
    closeConn(doc, conn)
  }
}

const setupWSConnection = (conn, req, { docName = req.url.slice(1).split('?')[0], gc = true } = {}) => {

  conn.binaryType = 'arraybuffer'

  const doc = getYDoc(docName)
  doc.conns.set(conn, new Set())

  conn.on('message', message => messageListener(conn, doc, new Uint8Array(message)));

  conn.on('close', () => closeConn(doc, conn));

  {
    const encoder = encoding.createEncoder()
    encoding.writeVarUint(encoder, messageSync)
    syncProtocol.writeSyncStep1(encoder, doc)
    send(doc, conn, encoding.toUint8Array(encoder))
  }

}

export default setupWSConnection;
