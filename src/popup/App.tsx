import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import ZoomPages from '@/utils/enums/ZomPages';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import ServerInfo from '@/pages/ServerInfo';
import Record from '@/pages/Record';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box width={350} px={2} py={4}>
        <MemoryRouter initialEntries={[ZoomPages.record]}>
          <Routes>
            <Route path={ZoomPages.record} Component={Record} />
            <Route path={ZoomPages.serverInfo} Component={ServerInfo} />
            <Route path={ZoomPages.signIn} Component={SignIn} />
            <Route path={ZoomPages.signUp} Component={SignUp} />
            <Route path={ZoomPages.forgotPassword} Component={ForgotPassword} />
          </Routes>
        </MemoryRouter>
      </Box>
    </ThemeProvider>
  );
};

