import React from 'react';
import '../App.css';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import decodeJwtResponse from 'https://esm.run/jwt-decode';
import { useCookies } from 'react-cookie'; // Import useCookies

const clientId = '163568262227-tcueb2uupso50redvflnv58mbeffq6pn.apps.googleusercontent.com'; 

function Login() {
  const navigate = useNavigate();

  const [cookies, setCookie] = useCookies(["user_data"]);

  const onSuccess = (response) => {
    const responsePayload = decodeJwtResponse(response.credential);

    // Store user data in a cookie
    const userData = {
      id: responsePayload.sub,
      fullName: responsePayload.name,
      givenName: responsePayload.given_name,
      familyName: responsePayload.family_name,
      imageUrl: responsePayload.picture,
      email: responsePayload.email,
    };

    // Set the cookie with the user data
    setCookie('user_data', JSON.stringify(userData), { expires: new Date(Date.now() + 86400000) }); // Set cookie to expire in 1 day


    // Redirect to the "/chat" page
    navigate('/chat');
  };

  const onFailure = (error) => {
    console.log(error);
  };

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <div className="login-container">
        <div className="left-section"></div>
        <div className="spacer"></div>
        <div className="right-section">
          <h1>Welcome to PTB</h1>
          <p>Personal Tutoring Bot - Ask questions related to your lectures, quiz yourself, and revise with the bot.</p>
          <div className='loginButton'>
            <GoogleLogin
              onSuccess={onSuccess}
              onError={onFailure}
              type='standard'
              theme='outline'
              size='large'
              shape='pill'
            >
            </GoogleLogin>
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
}

export default Login;
