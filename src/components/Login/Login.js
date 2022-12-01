import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Button, FormControl, Input, Backdrop, CircularProgress,
  InputLabel, Paper, Typography, Snackbar
} from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';
import log from 'loglevel';
import styles from './styles';
import { config } from '../../config';

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

async function loginUserAsync(credentials) {

  var creds = {
    "UserName": credentials.username,
    "Password": credentials.password
  };

  let url = `${config.API_URL}/auth/login`;

  log.debug(`loginUser(${credentials.username}) url: ${url})`);

  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(creds)
  })
    .then(
      data => data.json()
    )
}

const Login = ({ authActions, classes }) => {

  const [username, setUserName] = useState();
  const [password, setPassword] = useState();
  const [open, setOpen] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);

  const handleClose = (event, reason) => {

    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const handleSubmit = async e => {

    e.preventDefault();

    setInProgress(true);

    const response = await loginUserAsync({
      username,
      password
    });

    if (response.statusCode != 200) {
      setOpen(true);
    }

    setInProgress(false);
    authActions.setToken(response, false);
    authActions.setUserName(username);

  }

  return (
    <main className={classes.main}>
      {<Paper className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        { inProgress && <div><br/><CircularProgress color="inherit" /></div>}        
        { !inProgress && <form onSubmit={handleSubmit}>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="username">Username</InputLabel>
            <Input
              name="username"
              type="username"
              onChange={e => setUserName(e.target.value)}
            />
          </FormControl>
          <FormControl margin="normal" required fullWidth>
            <InputLabel htmlFor="password">Password</InputLabel>
            <Input
              name="password"
              type="password"
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
            />
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
          >
            Sign in
          </Button>
        </form>}
        <Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
          <Alert onClose={handleClose} severity="error">
            Login error!
          </Alert>
        </Snackbar>
      </Paper>}
    </main>
  )
}

export default withStyles(styles)(Login);