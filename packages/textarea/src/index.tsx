import React from 'react';
import ReactDOM from 'react-dom';

import YTextArea from './yjs/YTextArea';
import YCodeMirror from './yjs/YCodeMirror';

import AMEditor from './automerge/AMEditor';

import './index.css';

ReactDOM.render(
  <div>
    <AMEditor />
    <YTextArea />
    <YCodeMirror />
  </div>
  ,
  document.getElementById('root')
);
