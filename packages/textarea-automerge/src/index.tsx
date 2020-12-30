import React from 'react';
import { render } from 'react-dom';

import AutomergeTextAreaPerf from './automerge/AutomergeTextAreaPerf';

import './index.css';

render(
  <div>
    <AutomergeTextAreaPerf docId="perf" />
  </div>
  ,
  document.getElementById('root')
);
