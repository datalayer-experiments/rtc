import React, { 
  ChangeEvent, 
  useEffect,
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
/*
import ReconnectingWebSocket from './../utils/ReconnectingWebsocket';
const ws = new ReconnectingWebSocket('ws://localhost:4400/automerge')
ws.addEventListener('close', () => {
  if (ws._shouldReconnect) ws._connect()
})
*/
const AutomergeTextArea = (props: {docId: string}) => {

  const docId = props.docId;

  const [doc, setDoc] = useState<Doc>(initDocument());
  const docRef = useRef<Doc>();
  docRef.current = doc;

  const [history, setHistory] = useState(new Array(new Array()));

  const clientRef = useRef<AutomergeWsClient>(new AutomergeWsClient({
    socket: new WebSocket('ws://localhost:4400/automerge'),
    savedData: null,
    save: null,
    onChange: (docId: any, doc: Doc) => {
// Get TypeError in handleTextChange: The first argument to Automerge.change must be the document root
//      setDoc(doc);
    },
    onMessage: (message: any) => {
      if (message.data && message.data.changes) {
        const changedDoc = applyChanges(docRef.current, message.data.changes);
        setDoc(changedDoc);
      }
    }
  }));

  useEffect(() => {
    clientRef.current.subscribe(docId);
  }, []);
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
    const ret = clientRef.current.applyChanges(docId, changes);
    if (!ret) {
      console.error('Failed to apply changes to the doc.')
    };
  };

  const handleShowHistory = () => {
    setHistory(getHistory(doc));
  };

  const value = doc.textArea ? doc.textArea.toString() : '';

  return (
    <div>
      <h3>Automerge TextArea (id: {docId})</h3>
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

}

export default AutomergeTextArea;
