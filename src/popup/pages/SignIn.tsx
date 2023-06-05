import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { PopupPages } from '@/utils/enums/PopupPages';
import { StorageItems } from '@/utils/enums/StorageItems';
import { useStorage } from '@/hooks/useStorage';
import baseApi from '@/services/baseApi';

enum SignInItems {
  Email = 'email',
  Password = 'password',
};

export default function SignIn() {
  const navigate = useNavigate();
  const [, setAuthToken] = useStorage(StorageItems.AuthToken);
  const [, setUserInfo] = useStorage(StorageItems.UserInfo);

  const [formData, setFormData] = React.useState({
    [SignInItems.Email]: '',
    [SignInItems.Password]: '',
  });

  const handleChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(data => ({
      ...data,
      [e.target.name]: e.target.value
    }));
  }, []);

  const handleSubmit = React.useCallback(async () => {
    try {
      const { data } = await baseApi.post('/auth/signin', formData);
      setAuthToken(data.token);
      setUserInfo(data.user);
      baseApi.defaults.headers.common['Authorization'] = data.token;
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
      <Box display="flex" justifyContent="center" alignItems="center" mt={2} mb={4}>
        <img src="/logo.png" width={150} />
      </Box>
      <Typography component="h1" variant="h5">
        Sign in
      </Typography>
      <Box sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          label="Email Address"
          name={SignInItems.Email}
          value={formData[SignInItems.Email]}
          onChange={handleChange}
          autoFocus
        />
        <TextField
          margin="normal"
          required
          fullWidth
          label="Password"
          type="password"
          name={SignInItems.Password}
          value={formData[SignInItems.Password]}
          onChange={handleChange}
          autoComplete="current-password"
        />
        <FormControlLabel
          control={<Checkbox value="remember" color="primary" />}
          label="Remember me"
        />
        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={handleSubmit}
        >
          Sign In
        </Button>
        <Grid container>
          <Grid item xs={12}>
            <Link href="#" variant="body2" onClick={() => navigate(PopupPages.forgotPassword)}>
              Forgot password?
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Link href="#" variant="body2" onClick={() => navigate(PopupPages.signUp)}>
              {"Don't have an account? Sign Up"}
            </Link>
          </Grid>
          <Grid item xs={12}>
            <Link href="#" variant="body2" onClick={() => navigate(PopupPages.serverInfo)}>
              Server info should be updated?
            </Link>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
