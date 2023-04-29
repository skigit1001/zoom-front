import { useMemo } from 'react';
import { StorageItems } from "@/utils/enums/StorageItems";
import { useChromeStorageSync } from "use-chrome-storage";
import axios, { AxiosInstance } from 'axios';

export default function useAPI(route?: string) {
  const [serverAddr] = useChromeStorageSync(StorageItems.ServerAddr);

  const axiosInstance = useMemo(() => {
    if (serverAddr) {
      const axInst: AxiosInstance = axios.create({
        baseURL: `${serverAddr}/api/${route}`
      });
      axInst.interceptors.response.use((value) => value.data);
      return axInst;
    }
    return null;
  }, [serverAddr, route]);

  return axiosInstance;
};
