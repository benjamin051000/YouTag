import React from 'react';
import logo from './logo.svg';
import './App.css';

import { GoogleLogin } from 'react-google-login';


function responseGoogle(response) {
  console.log(response);
  console.log(response.profileObj); // This may be the important stuff in the response
}


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>YouTag</h1>
        <h3>A simple way to organize your content. Finally.</h3>
        <img src={logo} className="App-logo" alt="logo" />
        <p>Sign in with your Google account to get started.</p>
        <GoogleLogin 
        clientId="15399846948-gut7ja6158h95pesfn8il1dej16rh519.apps.googleusercontent.com"
        onSuccess={responseGoogle}
        />
      </header>
    </div>
  );
}

export default App;
