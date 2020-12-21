import React, { ChangeEvent, useEffect, useState } from "react";
import AutomergeClient from "@datalayer-rtc/automerge/lib/ws/client";
import {
  initDocument,
  applyChanges,
  getChanges,
  applyInput,
  getHistory
} from "./AMActions";
import { Doc } from './AMActions';
import simpleDiff from '../utils/simpleDiff'
import ReconnectingWebSocket from './ReconnectingWebsocket'

const DOC_ID = 'reacttextarea';

const ws = new ReconnectingWebSocket('ws://localhost:4400/automerge')

ws.addEventListener('close', () => {
  if (ws._shouldReconnect) ws._connect()
})

const client = new AutomergeClient({
  socket: ws,
  savedData: null,
  save: null,
  onChange: null
})

// Actions

function subscribe(args) {
  client.subscribe(args)
}

function change(docId, attr, value) {
  const ret = client.change(docId, doc => {
    doc[attr] = value
  })
}

const AMEditor = (props: any) => {

  const [textContent, settextContent] = useState('');
  const [doc, setDoc] = useState<Doc>(initDocument());

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    let diff = simpleDiff(doc.textContent.toString(), event.target.value);
    const newDoc = applyInput(doc, diff);
    const changes = getChanges(doc, newDoc);
    console.log('Diff', diff);
    console.log('Changes', changes);
    const ret = client.diff(DOC_ID, diff.pos, diff.remove, diff.insert);
    if (!ret) {
      console.error('Failed to diff doc.')
    }  
    setDoc(newDoc);
    settextContent(event.target.value);
  };

  const handleShowHistory = () => {
    getHistory(doc);
  };

  useEffect(() => {
    subscribe(DOC_ID);
  }, []);

  useEffect(() => {
    ws.onmessage = (message: any) => {
      if (message.data) {
        const m = JSON.parse(message.data);
        if (m.data && m.data.changes) {
          const changes = m.data.changes
          console.log('----', changes);
          const changedDoc = applyChanges(doc, changes);
          setDoc(changedDoc);
          if (changedDoc.textContent) {
            console.log('merged text', changedDoc.textContent.toString());
            settextContent(changedDoc.textContent.toString());
          }
        }
      }
    };
  });

  return (
    <div>
      <h3>Automerge TextArea</h3>
      <textarea 
        cols={80}
        rows={5}
        onChange={handleTextChange} 
        value={textContent} 
      />
      <div><button onClick={handleShowHistory}>Automerge History</button></div>
    </div>
  );
};

export default AMEditor;
