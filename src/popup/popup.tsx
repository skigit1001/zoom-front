import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(<App />, root);

chrome.tabCapture.capture({ video: true, audio: true}, (stream) => {
  console.log(stream);
})