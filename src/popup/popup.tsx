
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';

import baseApi from '@/services/baseApi';
import { StorageItems } from '@/utils/enums/StorageItems';

const root = document.createElement('div');
document.body.appendChild(root);

chrome.storage.local.get(async (items) => {
  const authToken = items[StorageItems.AuthToken];
  const serverAddr = items[StorageItems.ServerAddr];

  if (serverAddr) {
    baseApi.defaults.baseURL = `${serverAddr}/api`;

    if (authToken) {
      baseApi.defaults.headers.common['Authorization'] = authToken;
    }

    try {
      await baseApi.post('/account');
    } catch (err) {
      await new Promise<void>((resolve) => {
        chrome.storage.local.set({ [StorageItems.AuthToken]: '' }, () => resolve());
      });
      baseApi.defaults.headers.common['Authorization'] = '';
    }
  }

  const router = (await import('./router')).default;

  ReactDOM.render(
    <RouterProvider router={router} />,
    root
  );
});
