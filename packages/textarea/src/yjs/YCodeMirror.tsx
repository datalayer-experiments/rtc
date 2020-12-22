import React from 'react';

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { CodemirrorBinding } from 'y-codemirror'

import CodeMirror from 'codemirror'

import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/python/python';

const YCodeMirror = () => {

  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider(
    'ws://localhost:1234', 
    'codemirror-demo',
     ydoc
  )
  const yText = ydoc.getText('codemirror')

  const editorContainer = document.createElement('div')
  editorContainer.setAttribute('id', 'editor')
  document.body.append(editorContainer, null)

  const editor = CodeMirror(editorContainer, {
    mode: 'javascript',
    lineNumbers: true
  })
  
  const binding = new CodemirrorBinding(yText, editor, provider.awareness)
/*
  const connectBtn = (document.getElementById('y-connect-btn'))
  connectBtn.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect()
      connectBtn.textArea = 'Connect'
    } else {
      provider.connect()
      connectBtn.textArea = 'Disconnect'
    }
  })
*/
  provider.connect();

  return  <h3>Y.js CodeMirror</h3>

}

export default YCodeMirror;
