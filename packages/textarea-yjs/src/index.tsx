import React from 'react';
import { render } from 'react-dom';

import YTextArea from './yjs/YTextArea';
import YCodeMirror from './yjs/YCodeMirror';

import './index.css';

render(
  <div>
    <YTextArea docId="first" />
    <YTextArea docId="second" />
    <YCodeMirror />
  </div>
  ,
  document.getElementById('root')
);
