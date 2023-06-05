import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';

import baseApi from '@/services/baseApi';
import { StorageItems } from '@/utils/enums/StorageItems';

const storageItems = await new Promise((resolve) => {
  chrome.storage.local.get((items) => resolve(items));
});

const authToken = storageItems[StorageItems.AuthToken];
const serverAddr = storageItems[StorageItems.ServerAddr];

if (serverAddr) {
  baseApi.defaults.baseURL = `${serverAddr}/api`;

  if (authToken) {
    baseApi.defaults.headers.common['Authorization'] = authToken;
  }

  try {
    await baseApi.get('/account');
  } catch (err) {
    await new Promise<void>((resolve) => {
      chrome.storage.local.set({ [StorageItems.AuthToken]: '' }, () => resolve());
    });
    baseApi.defaults.headers.common['Authorization'] = '';
  }
}

/**
 * Warning: Don't import router statically
 * 
 * static import will cause unexpected behaviors in loader of react-router-dom
 */
const router = (await import('./router')).default;

const root = document.createElement('div');
document.body.appendChild(root);

ReactDOM.render(
  <RouterProvider router={router} />,
  root
);