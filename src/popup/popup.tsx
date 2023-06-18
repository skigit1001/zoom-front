import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'react-router-dom';

import baseApi from '@/services/baseApi';
import { StorageItems } from '@/utils/enums/StorageItems';
import { getStorageItems, setStorageItems } from '@/utils/helpers/storage';

const { authToken, serverAddr } = await getStorageItems([
  StorageItems.AuthToken,
  StorageItems.ServerAddr,
]);

if (serverAddr) {
  baseApi.defaults.baseURL = `${serverAddr}/api`;

  if (authToken) {
    baseApi.defaults.headers.common['Authorization'] = authToken;
  }

  try {
    await baseApi.get('/account');
  } catch (err) {
    await setStorageItems({ [StorageItems.AuthToken]: '' });
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

ReactDOM.render(<RouterProvider router={router} />, root);
