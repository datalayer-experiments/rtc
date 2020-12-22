import React, { ChangeEvent, useEffect, useState } from "react";

import AutomergeWsServer from "@datalayer-rtc/automerge/lib/ws/AutomergeWsClient";

import {
  Doc,
  initDocument,
  applyChanges,
  getChanges,
  applyInput,
  getHistory
} from "./AutomergeActions";

import simpleDiff from '../utils/simpleDiff'

// import ReconnectingWebSocket from './ReconnectingWebsocket';

const DOC_ID = 'reacttextarea';
/*
const ws = new ReconnectingWebSocket('ws://localhost:4400/automerge')
ws.addEventListener('close', () => {
  if (ws._shouldReconnect) ws._connect()
})
*/
const ws = new WebSocket('ws://localhost:4400/automerge');

const client = new AutomergeWsServer({
  socket: ws,
  savedData: null,
  save: null,
  onChange: null
});

const AutomergeTextArea = (props: any) => {

  let textArea: HTMLTextAreaElement;

  const [doc, setDoc] = useState<Doc>(initDocument());
  const [history, setHistory] = useState(new Array(new Array()));

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    let diff = simpleDiff(doc.textArea.toString(), event.target.value);
    const newDoc = applyInput(doc, diff);
    setDoc(newDoc);
    const changes = getChanges(doc, newDoc);
    const ret = client.applyChanges(DOC_ID, changes);
    if (!ret) {
      console.error('Failed to apply changes to the doc.')
    };
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
          const changedDoc = applyChanges(doc, changes);
          setDoc(changedDoc);
        }
      }
    };
  });

  let text = '';
  if (doc.textArea) {
    text = doc.textArea.toString();
  }

  return (
    <div>
      <h3>Automerge TextArea</h3>
      <textarea
        cols={80}
        rows={5}
        onChange={handleTextChange}
        value={text}
        ref={(input) => { textArea = input }}
      />
      <div><button onClick={handleShowHistory}>Automerge History</button></div>
      <div>{ history.map(h1 => h1.map(h2 => <div>{h2}</div>)) }</div>
    </div>
  );

};

export default AutomergeTextArea;
