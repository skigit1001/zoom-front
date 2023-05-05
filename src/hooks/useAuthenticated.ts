import { useEffect, useState } from 'react';
import useAPI from './useAPI';

export default function useAuthenticated() {
  const accountAPI = useAPI('account');
  const [authenticated, setAuthenticated] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (accountAPI) {
      accountAPI.get('/')
        .then(() => {
          setAuthenticated(true);
          setInitialized(true);
        })
        .catch(() => {
          setAuthenticated(false);
          setInitialized(true);
        });
    } else {
      setAuthenticated(false)
    }
  }, [accountAPI]);

  return [authenticated, initialized];
};
