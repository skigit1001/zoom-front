import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { MemoryRouter } from 'react-router-dom';
import { PopupPages } from '@/utils/enums/PopupPages';

const root = document.createElement('div');
document.body.appendChild(root);
ReactDOM.render(
  <MemoryRouter initialEntries={[PopupPages.loading]}>
    <App />
  </MemoryRouter>,
  root
);
