import React, { 
  ChangeEvent, 
  useState,
  useRef
} from "react";

import AutomergeWsClient from "@datalayer-rtc/automerge/lib/ws/AutomergeWsClient";

import {
  Doc,
  initDocument,
  applyChanges,
  getChanges,
  applyInput,
  getHistory
} from "./AutomergeActions";

import simpleDiff from '../utils/simpleDiff'

// import ReconnectingWebSocket from './../utils/ReconnectingWebsocket';

const DOC_ID = 'reacttextarea';
/*
const ws = new ReconnectingWebSocket('ws://localhost:4400/automerge')
ws.addEventListener('close', () => {
  if (ws._shouldReconnect) ws._connect()
})
*/
const ws = new WebSocket('ws://localhost:4400/automerge');

let wsClient: AutomergeWsClient;

const AutomergeTextArea = (props: any) => {

  const [doc, setDoc] = useState<Doc>(initDocument());
  const [history, setHistory] = useState(new Array(new Array()));
  const stateRef = useRef<Doc>();
  stateRef.current = doc;

  if (!wsClient) {
    wsClient = new AutomergeWsClient({
      socket: ws,
      savedData: null,
      save: null,
      onChange: null,
      onMessage: (message: any) => {
        if (message.data && message.data.changes) {
          const changedDoc = applyChanges(stateRef.current, message.data.changes);
          setDoc(changedDoc);
        }
      }
    });
    wsClient.subscribe(DOC_ID);
  }
/*
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
*/
const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    let diff = simpleDiff(doc.textArea.toString(), event.target.value);
    const newDoc = applyInput(doc, diff);
    setDoc(newDoc);
    const changes = getChanges(doc, newDoc);
    const ret = wsClient.applyChanges(DOC_ID, changes);
    if (!ret) {
      console.error('Failed to apply changes to the doc.')
    };
  };

  const handleShowHistory = () => {
    setHistory(getHistory(doc));
  };

  const value =  doc.textArea ? doc.textArea.toString() : '';

  return (
    <div>
      <h3>Automerge TextArea</h3>
      <textarea
        cols={80}
        rows={5}
        onChange={handleTextChange}
        value={value}
      />
      <div><button onClick={handleShowHistory}>Automerge History</button></div>
      <div>{ history.map(h1 => h1.map(h2 => <div>{h2}</div>)) }</div>
    </div>
  );

};

export default AutomergeTextArea;
