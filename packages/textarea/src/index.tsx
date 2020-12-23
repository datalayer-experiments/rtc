import React from 'react';
import ReactDOM from 'react-dom';

import YTextArea from './yjs/YTextArea';
import YCodeMirror from './yjs/YCodeMirror';

import AutomergeTextArea from './automerge/AutomergeTextArea';

import './index.css';

ReactDOM.render(
  <div>
    <AutomergeTextArea docId="first" />
    <AutomergeTextArea docId="second" />
    <YTextArea />
    <YCodeMirror />
  </div>
  ,
  document.getElementById('root')
);
