import React, { useEffect } from 'react';

import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import YTextAreaBinding from './YTextAreaBinding'

function textareaDidChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
  console.log("textareaDidChange", event)
}

const YTextArea = () => {
  const ydoc = new Y.Doc()
  const provider = new WebsocketProvider(
    'ws://localhost:1234', 
    'my-document-name', 
    ydoc
    )
  const ytext = ydoc.getText('textarea-content')
  let textArea: HTMLTextAreaElement;
  let binding: any;
  useEffect(() => {
    binding = new YTextAreaBinding(ytext, textArea)
  });
  return <div className="App">
      <textarea
        cols={80}
        rows={40}
        onChange={textareaDidChange}
        ref={(input) => { textArea = input }}
      />
    </div>
};

export default YTextArea;
