import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Drawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '@/hooks/useStorage';
import { StorageItems } from '@/utils/enums/StorageItems';
import { PopupPages } from '@/utils/enums/PopupPages';
import { Button } from '@mui/material';
import { RTMessages } from '@/utils/enums/RTMessages';

const drawerWidth = 240;

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

export default function PersistentDrawerRight() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();
  const [, setAuthToken] = useStorage(StorageItems.AuthToken);
  const [, setUserInfo] = useStorage(StorageItems.UserInfo);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUserInfo(null);
    navigate(PopupPages.signIn);
  };

  const handleStartRecording = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const streamId = await new Promise((resolve) => chrome.tabCapture.getMediaStreamId({ consumerTabId: tab.id }, (streamId) => resolve(streamId)));
    await chrome.runtime.sendMessage({
      type: RTMessages.SetMediaStreamId,
      data: {
        streamId,
        consumerTabId: tab.id
      },
    });
  };

  const handleStopRecording = () => {
    chrome.runtime.sendMessage({ type: RTMessages.StopRecording });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: 400 }}>
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'flex-start' }}>
          <IconButton
            color="inherit"
            onClick={handleDrawerOpen}
            sx={{ ...(open && { display: 'none' }), mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
          },
        }}
        variant="temporary"
        anchor="left"
        open={open}
        onClose={handleDrawerClose}
      >
        <DrawerHeader>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box>
        <DrawerHeader />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleStartRecording}
            >
              Start Recording
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Button variant="contained" fullWidth onClick={handleStopRecording}>
              Stop Recording
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
