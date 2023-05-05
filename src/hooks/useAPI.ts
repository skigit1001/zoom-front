import { useMemo } from 'react';
import { StorageItems } from "@/utils/enums/StorageItems";
import axios, { AxiosInstance } from 'axios';
import { useStorage } from './useStorage';

export default function useAPI(route?: string) {
  const [serverAddr] = useStorage(StorageItems.ServerAddr);
  const [authToken] = useStorage(StorageItems.AuthToken);

  const axiosInstance = useMemo(() => {
    if (serverAddr) {
      console.log(authToken);
      const axInst: AxiosInstance = axios.create({
        baseURL: `${serverAddr}/api/${route}`,
        headers: {
          Authorization: `Bearer ${authToken}`
        },
      });
      axInst.interceptors.response.use((value) => value.data);
      return axInst;
    }
    return null;
  }, [serverAddr, authToken, route]);

  return axiosInstance;
};
