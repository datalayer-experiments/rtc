import React, { useEffect } from 'react';

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import YBinder from './YBinder'

const YTextArea = () => {
  const doc = new Y.Doc()
  const provider = new WebsocketProvider(
    'ws://localhost:1234',
    'yjs-textarea',
    doc
  )
  const text = doc.getText('textarea-content');
  let textArea: HTMLTextAreaElement;
  let binder: YBinder;
  useEffect(() => {
    binder = new YBinder(text, textArea)
  });
  return <div className="App">
      <h3>Y.js TextArea</h3>
      <textarea
        cols={80}
        rows={5}
        ref={(input) => { textArea = input }}
      />
    </div>
};

export default YTextArea;
