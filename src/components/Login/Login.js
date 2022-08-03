import React, { useState } from 'react';
// import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import {
  Button, FormControl, Input,
  InputLabel, Paper, Typography,
} from '@material-ui/core';
import log from 'loglevel';
import styles from './styles';
import { config } from '../../config';

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

  const handleSubmit = async e => {
    e.preventDefault();
    const response = await loginUserAsync({
      username,
      password
    });    

    authActions.setToken(response, false);
    authActions.setUserName(username);
  }

  return (
    <main className={classes.main}>
      <Paper className={classes.paper}>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <form onSubmit={handleSubmit}>
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
        </form>
      </Paper>
    </main>
  )
}

export default withStyles(styles)(Login);