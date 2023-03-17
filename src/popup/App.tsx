import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import LINKS from '@/utils/constants/links';

const theme = createTheme();

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box width={350} px={2} py={4}>
        <MemoryRouter initialEntries={[LINKS.signIn]}>
          <Routes>
            <Route path={LINKS.signIn} Component={SignIn} />
            <Route path={LINKS.signUp} Component={SignUp} />
          </Routes>
        </MemoryRouter>
      </Box>
    </ThemeProvider>
  );
};

