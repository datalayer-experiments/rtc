import Automerge, { Text } from 'automerge'
import WebSocket from 'ws'
import WatchableDoc from './WatchableDoc'

const http = require('http')

const mutex = require('lib0/dist/mutex.cjs')
const map = require('lib0/dist/map.cjs')

const wsReadyStateConnecting = 0
const wsReadyStateOpen = 1

export const docs = new Map()

export type Doc = {
  docId: string;
  textArea: Text;
};

const send = (doc, conn, changes) => {
  if (conn.readyState !== wsReadyStateConnecting && conn.readyState !== wsReadyStateOpen) {
    onClose(doc, conn, null)
  }
  try {
    const message = {
      changes: changes
    }
    console.log('Sending message: ', message)
    conn.send(JSON.stringify(message), err => { err != null && onClose(doc, conn, err) })
  } catch (e) {
    onClose(doc, conn, e)
  }
}

const updateHandler = (doc, changes) => {
  console.log("--- New doc", doc)
  console.log("--- Changes", changes)
//  doc.conns.forEach((_, conn) => send(doc, conn, message))
}

class WSSharedDoc extends WatchableDoc {
  private name = null;
  private mux = null;
  public conns = new Map()
  constructor(doc: Doc) {
    super(doc)
    this.name = doc.docId
    this.mux = mutex.createMutex()
    this.registerHandler(updateHandler)
  }
}

const onMessage = (conn, doc, message) => {
  console.log(message)
  const m = JSON.parse(message)
  console.log('---', m['changes'])
  send(doc, conn, m['changes'])
}

export const getDoc = (docname) => map.setIfUndefined(docs, docname, () => {
  const doc = Automerge.change(Automerge.init<Doc>(), doc => {
    doc.docId = docname;
    doc.textArea = new Automerge.Text();
    doc.textArea.insertAt(0, 'h', 'e', 'l', 'l', 'o')
    doc.textArea.deleteAt(0)
    doc.textArea.insertAt(0, 'H')
  })
  const sharedDoc = new WSSharedDoc(doc)
  docs.set(docname, sharedDoc)
  return sharedDoc
})

const onClose = (doc, conn, err) => {
  console.log('Closing', err)
  if (doc.conns.has(conn)) {
    doc.conns.delete(conn)
  }
  conn.close()
}

const setupWSConnection = (conn, req, { docName = req.url.slice(1).split('?')[0], gc = true } = {}) => {
  const doc: WSSharedDoc = getDoc(docName)
  doc.conns.set(conn, new Set())
  conn.on('message', message => onMessage(conn, doc, message))
  conn.on('close', err => onClose(doc, conn, err))
  // put the following in a variables in a block so the interval handlers don't keep in in scope
  {
    const changes = Automerge.getAllChanges(doc.get())
    send(doc, conn, changes)
  }
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
