import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const withAuthentication = (WrappedComponent) => (props) => {
  const userDataCookie = Cookies.get('user_data');
  
  if (!userDataCookie) {
    return <Navigate to="/" />;
  }

  return <WrappedComponent {...props} />;
};

export default withAuthentication;
