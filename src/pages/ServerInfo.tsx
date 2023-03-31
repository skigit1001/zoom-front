import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ZoomPages from '@/utils/enums/ZomPages';

export default function ServerInfo() {
  const navigate = useNavigate();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      email: data.get('email'),
      password: data.get('password'),
    });
  };

  const handleClick = () => {
    chrome.tabs.query({ active: true }, function (tabs) {
      console.log(tabs);
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "camera-request"
      });
    });

    // Check if recording is ongoing
    chrome.runtime.sendMessage({ type: "record-request" }, function (response) {
      console.log(response);
    });

    // Check if current tab is unable to be recorded
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, tabs => {
      if (tabs.length && tabs[0].url.includes("chrome://") || tabs[0].url.includes("chrome-extension://") || tabs[0].url.includes("chrome.com") || tabs[0].url.includes("chrome.google.com")) {
        alert('cannot record');
      }
    });
  }

  const handleRecord = () => {
    chrome.runtime.sendMessage({ type: "record" });
  };

  const handleStopRecord = () => {
    chrome.runtime.sendMessage({ type: "stop-save" });
  }

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
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="server-addr"
            label="Server Address"
            name="server-addr"
            autoFocus
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleClick}
          >
            Save
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleRecord}
          >
            Record
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleStopRecord}
          >
            Stop Record
          </Button>
          <Link href="#" variant="body2" onClick={() => navigate(ZoomPages.signIn)}>
            Already have a correct info? Sign in
          </Link>
        </Box>
      </Box>
    </Container>
  );
}
