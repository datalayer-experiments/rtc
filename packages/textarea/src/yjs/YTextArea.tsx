import React, { useEffect } from 'react';

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import YTextAreaBinding from './YTextAreaBinding'

const YTextArea = () => {
  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider(
    'ws://localhost:1234', 
    'yjs-textarea',
    ydoc
  )
  const ytext = ydoc.getText('textarea-content')
  let textArea: HTMLTextAreaElement;
  let binding: any;
  useEffect(() => {
    binding = new YTextAreaBinding(ytext, textArea)
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
