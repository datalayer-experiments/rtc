import React, { ChangeEvent, useEffect, useState } from "react";
import AutomergeClient from "@datalayer-rtc/automerge/lib/ws/client";
import {
  initDocument,
  applyChanges,
  getChanges,
  applyInput
} from "./AMActions";
import simpleDiff from '../utils/simpleDiff'
import ReconnectingWebSocket from './reconnecting-websocket'

const ROOM_ID = 'myroom';

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
  console.log('----->>>', ret)
  if (!ret) {
    console.error('Failed to change doc.')
  }
}

const AMEditor = (props: any) => {

  const [text, setText] = useState('');
  const [doc, setDoc] = useState(initDocument());

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    let diff = simpleDiff(doc.text.toString(), event.target.value)
    const newDoc = applyInput(doc, diff);
    const changes = getChanges(doc, newDoc);
    console.log('Changes', changes);
//    ws.send(JSON.stringify(changes));
    change(ROOM_ID, 'text', 'helloooo');
//    setDoc(newDoc);
    setText(event.target.value);
  };

  const handleGetText = () => {
    console.log(text);
  };

  useEffect(() => {
    subscribe(ROOM_ID);
//    change(ROOM_ID, 'text', 'hello');
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
          if (changedDoc.text) {
            console.log('merged text', changedDoc.text.toString());
            setText(changedDoc.text.toString());
          }
        }
      }
    };
  });

  return (
    <div>
      <div>Automerge Text Area</div>
      <textarea onChange={handleTextChange} value={text} />
      <button onClick={handleGetText}>Get Text</button>
    </div>
  );
};

export default AMEditor;
