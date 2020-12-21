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
import ReconnectingWebSocket from './ReconnectingWebsocket';

const DOC_ID = 'reacttextarea';
/*
const ws = new ReconnectingWebSocket('ws://localhost:4400/automerge')
ws.addEventListener('close', () => {
  if (ws._shouldReconnect) ws._connect()
})
*/
const ws = new WebSocket('ws://localhost:4400/automerge');

const client = new AutomergeClient({
  socket: ws,
  savedData: null,
  save: null,
  onChange: null
});

// Actions.

function change(docId, attr, value) {
  const ret = client.change(docId, doc => {
    doc[attr] = value;
  });
};

const AMEditor = (props: any) => {

  const [textContent, settextContent] = useState('');
  const [history, setHistory] = useState(new Array(new Array()));
  const [doc, setDoc] = useState<Doc>(initDocument());

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    let diff = simpleDiff(doc.textContent.toString(), event.target.value);
    const newDoc = applyInput(doc, diff);
    const changes = getChanges(doc, newDoc);
    const ret = client.applyChanges(DOC_ID, changes);
    if (!ret) {
      console.error('Failed to apply changes to the doc.')
    };
    setDoc(newDoc);
    settextContent(event.target.value);
  };

  const handleShowHistory = () => {
    setHistory(getHistory(doc));
  };

  useEffect(() => {
    client.subscribe(DOC_ID);
  }, []);

  useEffect(() => {
    ws.onmessage = (message: any) => {
      if (message.data) {
        const m = JSON.parse(message.data);
        if (m.data && m.data.changes) {
          const changes = m.data.changes;
          console.log('Changes:', changes);
          const changedDoc = applyChanges(doc, changes);
          setDoc(changedDoc);
          settextContent(changedDoc.textContent.toString());
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
      <div>{ history.map(h1 => h1.map(h2 => <div>{h2}</div>)) }</div>
    </div>
  );

};

export default AMEditor;
