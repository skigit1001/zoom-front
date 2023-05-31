import axios from 'axios';

const baseApi = axios.create();

baseApi.interceptors.response.use((res) => res.data);

export default baseApi;
