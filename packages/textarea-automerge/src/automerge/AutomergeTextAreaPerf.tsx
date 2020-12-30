import React, { 
  ChangeEvent, 
  useEffect,
  useState,
  useRef
} from "react";

import {
  Doc,
  initDocument,
  applyChanges,
  getChanges,
  applyInput,
  getHistory
} from "./AutomergeActions";

import simpleDiff from '../utils/simpleDiff'

const AutomergeTextAreaPerf = (props: {docId: string}) => {

  const docId = props.docId;

  const [doc, setDoc] = useState<Doc>(initDocument());
  const docRef = useRef<Doc>();
  docRef.current = doc;

  const [history, setHistory] = useState(new Array(new Array()));

  const wsRef = useRef<WebSocket>();

  useEffect(() => {
    wsRef.current = new WebSocket('ws://localhost:4321/my-room')
    wsRef.current.onmessage = (message: any) => {
      if (message.data) {
        const m = JSON.parse(message.data);
        console.log(m)
        if (m.changes) {
          const changes = m.changes;
          const changedDoc = applyChanges(docRef.current, changes);
          setDoc(changedDoc);
        }
      }
    }
  }, []);

  const handleTextChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    event.preventDefault();
    let diff = simpleDiff(doc.textArea.toString(), event.target.value);
    const newDoc = applyInput(doc, diff);
    setDoc(newDoc);
    const changes = getChanges(doc, newDoc);
    wsRef.current.send(JSON.stringify({ changes: changes }));
  }

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

export default AutomergeTextAreaPerf;
