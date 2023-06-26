import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { POPUP_PATH } from '@/utils/constants/popup';
import { StorageItems } from '@/utils/enums/StorageItems';
import { getStorageItems, setStorageItems } from '@/utils/helpers/storage';

export default function ServerInfo() {
  const navigate = useNavigate();
  const [addr, setAddr] = useState('');

  useEffect(() => {
    getStorageItems().then(items => setAddr(items.serverAddr));
  }, []);

  const handleChangeServerAddr = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAddr(e.target.value);
    },
    []
  );

  const handleSaveServerInfo = useCallback(() => {
    setStorageItems({ [StorageItems.ServerAddr]: addr });
  }, [addr]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        mt={2}
        mb={4}
      >
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
        <Link
          href="#"
          variant="body2"
          onClick={() => navigate(POPUP_PATH.signIn)}
        >
          Already have a correct info? Sign in
        </Link>
      </Box>
    </Box>
  );
}
