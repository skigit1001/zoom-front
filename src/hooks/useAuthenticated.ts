import { useEffect, useState } from 'react';
import useAPI from './useAPI';
import { useNavigate } from 'react-router-dom';
import { PopupPages } from '@/utils/enums/PopupPages';
import { StorageItems } from '@/utils/enums/StorageItems';

export default function useAuthenticated() {
  const accountAPI = useAPI('account');
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (accountAPI) {
      accountAPI
        .get('/')
        .then(() => {
          setAuthenticated(true);
          setInitialized(true);
        })
        .catch(() => {
          setAuthenticated(false);
          setInitialized(true);
        });
    } else {
      chrome.storage.local.get(items => {
        if (!items[StorageItems.ServerAddr]) {
          navigate(PopupPages.serverInfo);
        } else {
          setAuthenticated(false);
        }
      });
    }
  }, [accountAPI]);

  return [authenticated, initialized];
}
