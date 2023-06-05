import { RouteObject, createMemoryRouter, redirect } from "react-router-dom";

import baseApi from "@/services/baseApi";
import { PopupPages } from "@/utils/enums/PopupPages";

import App from "./App";
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Loading from './pages/Loading';
import ServerInfo from './pages/ServerInfo';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';


const routes: RouteObject[] = [{
  path: '/',
  Component: App,
  loader: async ({ request }) => {
    const url = new URL(request.url);

    if (!baseApi.defaults.baseURL) {
      if (url.pathname !== PopupPages.serverInfo) {
        return redirect(PopupPages.serverInfo);
      }
      return true;
    }

    if (baseApi.defaults.headers.common['Authorization']) {
      return true;
    } else {
      if (url.pathname !== PopupPages.signIn) {
        return redirect(PopupPages.signIn);
      }
      return true;
    }
  },
  children: [
    { path: PopupPages.home, Component: Home },
    { path: PopupPages.serverInfo, Component: ServerInfo },
    { path: PopupPages.signIn, Component: SignIn },
    { path: PopupPages.signUp, Component: SignUp },
    { path: PopupPages.forgotPassword, Component: ForgotPassword },
    { path: PopupPages.loading, Component: Loading },
  ]
}];

const router = createMemoryRouter(routes, {
  initialEntries: [PopupPages.home],
});

export default router;
