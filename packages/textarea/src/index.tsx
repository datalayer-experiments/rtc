import React from 'react';
import { render } from 'react-dom';

// import Automerge from "automerge";
// import wasmBackend from 'automerge-backend-wasm';
// Automerge.setDefaultBackend(wasmBackend);

import YTextArea from './yjs/YTextArea';
import YCodeMirror from './yjs/YCodeMirror';

import AutomergeTextArea from './automerge/AutomergeTextArea';
import AutomergeTextArea2 from './automerge/AutomergeTextArea2';

import './index.css';

render(
  <div>
    <AutomergeTextArea2 docId="next" />
{/*
    <AutomergeTextArea docId="first" />
    <AutomergeTextArea docId="second" />
*/}
    <YTextArea docId="first" />
    <YTextArea docId="second" />
    <YCodeMirror />
  </div>
  ,
  document.getElementById('root')
);
