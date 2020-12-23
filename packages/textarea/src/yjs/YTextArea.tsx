import React, { useEffect } from 'react';

import * as Y from 'yjs'
import { WebsocketProvider } from '@datalayer-rtc/yjs/lib/ws-min/y-websocket'

import YBinder from './YBinder'

const YTextArea = (props: {docId: string}) => {
  const docId = props.docId;
  const doc = new Y.Doc();
  const provider = new WebsocketProvider(
    'ws://localhost:1234',
    docId,
    doc
  )
  const text = doc.getText('textarea-content');
  let textArea: HTMLTextAreaElement;
  let binder: YBinder;
  useEffect(() => {
    binder = new YBinder(textArea, text)
  });
  return <div className="App">
      <h3>Y.js TextArea (id: {docId})</h3>
      <textarea
        cols={80}
        rows={5}
        ref={(input) => { textArea = input }}
      />
    </div>
};

export default YTextArea;
