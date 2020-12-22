import AutomergeServer from './AutomergeWsServer';

const http = require('http')
const WebSocket = require('ws')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const dir = path.join(__dirname, 'data-server')

try {
  fs.mkdirSync(dir)
} catch (e) {
  if (e.code !== 'EEXIST') throw e
}

function fname(id) {
  return path.join(dir, id + '.json')
}

const automergeServer = new AutomergeServer({
  loadDocument: async id => {
    if (/^[a-z]+$/.exec(id)) {
      try {
        return await promisify(fs.readFile)(fname(id), 'utf8')
      } catch (e) {
        if (e.code === 'ENOENT') return null // create new
        return false // 404
      }
    }    
    return Promise.resolve(false)
  },
  saveDocument: (id, text) => {
    console.log('SEVER-START> Saving:', id)
    if (/[a-z]+/.exec(id)) {
      return promisify(fs.writeFile)(fname(id), text, 'utf8')
    }
    return Promise.resolve()
  },
  checkAccess: (id, req) => {
    return Promise.resolve(true);
  }
})

const server = http.createServer()
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws, req) => {
  if (req.url === '/automerge') {
    automergeServer.handleSocket(ws, req)
  } else {
    ws.send('Invalid route')
    ws.close()
  }
})

const PORT = 4400
server.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`)
})
