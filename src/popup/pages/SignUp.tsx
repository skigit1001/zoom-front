import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PopupPages } from '@/utils/enums/PopupPages';
import { StorageItems } from '@/utils/enums/StorageItems';
import { useStorage } from '@/hooks/useStorage';
import baseApi from '@/services/baseApi';

enum SignUpItems {
  Username = 'name',
  Email = 'email',
  Password = 'password',
  Role = 'role',
}

export default function SignUp() {
  const navigate = useNavigate();
  const [, setAuthToken] = useStorage(StorageItems.AuthToken);
  const [, setUserInfo] = useStorage(StorageItems.UserInfo);

  const [formData, setFormData] = React.useState({
    [SignUpItems.Username]: '',
    [SignUpItems.Email]: '',
    [SignUpItems.Password]: '',
    [SignUpItems.Role]: 'admin',
  });

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((data) => ({
        ...data,
        [e.target.name]: e.target.value,
      }));
    },
    []
  );

  const handleSubmit = React.useCallback(async () => {
    try {
      const { data } = await baseApi.post('/auth/signup', formData);
      setAuthToken(data.token);
      setUserInfo(data.user);
      setTimeout(() => navigate(PopupPages.home));
    } catch (err) {
      console.error(err);
    }
  }, [formData]);

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
        Sign up
      </Typography>
      <Box sx={{ mt: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Username"
              name={SignUpItems.Username}
              value={formData[SignUpItems.Username]}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              label="Email Address"
              name={SignUpItems.Email}
              value={formData[SignUpItems.Email]}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              required
              fullWidth
              name={SignUpItems.Password}
              label="Password"
              type="password"
              value={formData[SignUpItems.Password]}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleSubmit}
        >
          Sign Up
        </Button>
        <Grid container textAlign="right">
          <Grid item xs={12}>
            <Link
              href="#"
              variant="body2"
              onClick={() => navigate(PopupPages.signIn)}
            >
              Already have an account? Sign in
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Link
              href="#"
              variant="body2"
              onClick={() => navigate(PopupPages.serverInfo)}
            >
              Server info should be updated?
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
