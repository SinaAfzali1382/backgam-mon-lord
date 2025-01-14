import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Lobby from './Lobby';
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* <App /> */}
    <Lobby />
  </React.StrictMode>
);
