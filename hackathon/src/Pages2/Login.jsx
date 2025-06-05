import React from 'react';
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();

  const handleLoginSuccess = (response) => {
    console.log("Encoded JWT ID token:", response.credential);
    // Navigate to the `/api` route after successful login
    navigate('/api');
  };

  const handleLoginFailure = () => {
    console.log("Login Failed");
  };

  return (
    <div>
      <GoogleOAuthProvider clientId="79827696810-p0ustjoam74vn6jtlpkooj8g0mamf4s2.apps.googleusercontent.com">
        <div className="App">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={handleLoginFailure}
          />
        </div>
      </GoogleOAuthProvider>
    </div>
  );
}
