import AutomergeClient from './AutomergeWsClient';

const fs = require('fs');
const path = require('path');
const WebSocket = require('./ReconnectingWebsocket');
const readline = require('readline');

const socket = new WebSocket('http://localhost:4400/automerge');

socket.addEventListener('close', () => {
  if (socket._shouldReconnect) socket._connect()
})

const storeFile = path.join(__dirname, 'client-docs.json');

const client = new AutomergeClient({
  socket,
  savedData: (() => {
    try {
      return fs.readFileSync(storeFile, 'utf8');
    } catch (e) {
      return undefined;
    }
  })(),
  save: data => fs.writeFile(storeFile, data, 'utf8', () => {}),
  onChange: (() => {})
})

// Actions

function subscribe(args) {
  client.subscribe(args);
}

function change(args) {
  const ret = client.change(args[0], doc => {
    doc[args[1]] = args[2];
  })
  if (!ret) {
    console.error('CLI> Failed to change doc.');
  }
}

function diff(args) {
  const ret = client.diff(args[0], args[1], args[2], args[3]);
  if (!ret) {
    console.error('CLI> Failed to diff doc.');
  }
}

// CLI

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})
function handleLine() {
  rl.question('automerge-cli> ', line => {
    const [cmd, ...args] = line.trim().split(/ +/);
    console.log("CLI> :", cmd, args);
    if (cmd === 'subscribe' || cmd === 's') {
      subscribe(args);
    } else if (['c', 'ch', 'change'].includes(cmd)) {
      change(args)
    } else if (['d', 'diff'].includes(cmd)) {
      diff(args)
    } else {
      console.error('CLI> Unknown command "' + cmd + '"')
    }
    handleLine()
  })
}

handleLine();
