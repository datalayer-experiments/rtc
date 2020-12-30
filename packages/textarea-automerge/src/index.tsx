import React from 'react';
import { render } from 'react-dom';

import Automerge from "automerge";
import wasmBackend from 'automerge-backend-wasm';
Automerge.setDefaultBackend(wasmBackend);

import AutomergeTextAreaPerf from './automerge/AutomergeTextAreaPerf';

import './index.css';

render(
  <div>
    <AutomergeTextAreaPerf docId="next" />
  </div>
  ,
  document.getElementById('root')
);
