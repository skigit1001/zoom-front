import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { PopupPages } from '@/utils/enums/PopupPages';
import { useChromeStorageSync } from 'use-chrome-storage';
import { StorageItems } from '@/utils/enums/StorageItems';

export default function ServerInfo() {
  const navigate = useNavigate();
  const [serverAddr, setServerAddr] = useChromeStorageSync(StorageItems.ServerAddr, '');
  const [addr, setAddr] = useState(serverAddr);

  useEffect(() => setAddr(serverAddr), [serverAddr]);
  
  const handleChangeServerAddr = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setAddr(e.target.value);
  }, []);

  const handleSaveServerInfo = useCallback(() => {
    setServerAddr(addr);
  }, [addr]);

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={4}>
          <img src="/logo.png" width={150} />
        </Box>
        <Typography component="h1" variant="h5">
          Welcome
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="server-addr"
            label="Server Address"
            name="server-addr"
            value={addr}
            onChange={handleChangeServerAddr}
            autoFocus
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleSaveServerInfo}
          >
            Save
          </Button>
          <Link href="#" variant="body2" onClick={() => navigate(PopupPages.signIn)}>
            Already have a correct info? Sign in
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
