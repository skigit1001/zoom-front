import React from 'react';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function Record() {
  const handleRequest = () => {
    chrome.tabs.query({ active: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "camera-request"
      });
    });

    // Check if recording is ongoing
    chrome.runtime.sendMessage({ type: "record-request" });
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
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleRequest}
        >
          Request
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
      </Box>
    </Container>
  );
}
