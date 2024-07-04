import React from 'react';
import './App.css';
import Dashboard from './modules/Dashboard';
import Form from './modules/Form';
import { Routes, Route, Navigate } from 'react-router-dom';

// Protected Route Component
const Protected = ({ children, auth = false }) => {
  const isLogIn = localStorage.getItem('token') !== null;
  

  if (!isLogIn && auth) {
    return <Navigate to={'/users/sign_in'} />;
  } else if (isLogIn && ['/users/sign_in', '/users/sign_up'].includes(window.location.pathname)) {
    return <Navigate to={'/'} />;
  }
  return children;
};

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Protected auth={true}>
            <Dashboard />
          </Protected>
        }
      />
      <Route
        path="/users/sign_in"
        element={
          <Protected>
            <Form isSignInPage={true} />
          </Protected>
        }
      />
      <Route
        path="/users/sign_up"
        element={
          <Protected>
            <Form isSignInPage={false} />
          </Protected>
        }
      />
    </Routes>
  );
}

export default App;
