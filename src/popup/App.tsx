import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { PopupPages } from '@/utils/enums/PopupPages';
import SignIn from '@/popup/pages/SignIn';
import SignUp from '@/popup/pages/SignUp';
import ForgotPassword from '@/popup/pages/ForgotPassword';
import ServerInfo from '@/popup/pages/ServerInfo';
import Home from '@/popup/pages/Home';
import Loading from '@/popup/pages/Loading';
import useAuthenticated from '@/hooks/useAuthenticated';

const theme = createTheme();

export default function App() {
  const [authenticated, initialized] = useAuthenticated();
  const navigate = useNavigate();

  useEffect(() => {
    if (authenticated) {
      navigate(PopupPages.home);
    } else if (initialized) {
      navigate(PopupPages.signIn);
    }
  }, [authenticated, initialized]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box width={350} px={2} py={4}>
        <Routes>
          <Route path={PopupPages.home} Component={Home} />
          <Route path={PopupPages.serverInfo} Component={ServerInfo} />
          <Route path={PopupPages.signIn} Component={SignIn} />
          <Route path={PopupPages.signUp} Component={SignUp} />
          <Route path={PopupPages.forgotPassword} Component={ForgotPassword} />
          <Route path={PopupPages.loading} Component={Loading} />
        </Routes>
      </Box>
    </ThemeProvider>
  );
};

