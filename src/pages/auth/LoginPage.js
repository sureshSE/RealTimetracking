import React, { useState } from 'react';
import { useGoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Helmet, HelmetProvider } from "react-helmet-async";

const LoginPage = () => {
    const [accessToken, setAccessToken] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    const navigate = useNavigate(); // Hook for navigation

    const login = useGoogleLogin({
        onSuccess: async (response) => {
            console.log('Google Login Success:', response);

            // Save the access token
            setAccessToken(response.access_token);

            // Send the access token to your backend
            await sendTokenToServer(response.access_token);
        },
        onError: (error) => {
            console.error('Google Login Failed:', error);
            setStatusMessage('Login failed. Please try again.');
        },
        scope: 'openid email profile',
        responseType: 'token', // Fetch only access token
        prompt: 'select_account',
    });

    const sendTokenToServer = async (token) => {
        try {
            const response = await fetch('https://uat-tracking.rmtec.in:4000/api/v1/web/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ Token: token }), // Send Google access token
            });

            if (response.ok) {
                const responseData = await response.json();
                console.log('Server Response:', responseData);

                if (responseData?.data?.token) {
                    // Save the server response token to localStorage
                    localStorage.setItem('token', responseData.data.token);
                    localStorage.setItem('userDetails', responseData.data.userId);


                    // Update status and navigate to dashboard
                    setStatusMessage('Login successful! Redirecting...');
                    setTimeout(() => navigate('/dashboard'), 3000); // Redirect after 1 second
                } else {
                    setStatusMessage('Failed to retrieve token from server response.');
                }
            } else {
                console.error('Failed to send token to server:', response.statusText);
                setStatusMessage('Failed to send token to the server.');
            }
        } catch (error) {
            console.error('Error while sending token:', error);
            setStatusMessage('Error occurred while sending token.');
        }
    };

    return (
        <> <HelmetProvider>
                <Helmet>
                  <title>Login - RealTimeTracking</title>
                  <meta
                    name="description"
                    content="Overview of field agent performance and metrics."
                  />
                  <meta name="keywords" content="dashboard, field agent, management" />
                </Helmet>
              </HelmetProvider>
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "#f1f5f9", // Light background
                padding: "20px",
            }}
        >
            <div
                style={{
                    width: "80%",
                    maxWidth: "900px",
                    display: "flex",
                    backgroundColor: "#fff",
                    borderRadius: "10px",
                    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                }}
            >
                {/* Left Side */}
                <div
                    style={{
                        flex: 1,
                        backgroundColor: "#f9f9f9",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                    }}
                >
                    <img
                        src="login.jpg" // Replace with the illustration URL from your assets
                        alt="Login Illustration"
                        style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                    />
                </div>

                {/* Right Side */}
                <div
                    style={{
                        flex: 1,
                        padding: "40px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "flex-start",
                    }}
                >
                    <h1 style={{ fontSize: "28px", fontWeight: "600", marginBottom: "10px", color: "#333" }}>
                        Welcome Back!
                    </h1>
                    <p style={{ fontSize: "16px", color: "#555", marginBottom: "30px" }}>
                        Login to your account
                    </p>
                    <button
                        onClick={login}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "12px 24px",
                            fontSize: "16px",
                            fontWeight: "500",
                            color: "#4285F4", // Blue text color
                            backgroundColor: "#fff", // White background
                            border: "2px solid #4285F4", // Blue border
                            borderRadius: "4px",
                            cursor: "pointer",
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                            transition: "all 0.3s ease",
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = "#f1f3f4"; // Light grey on hover
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = "#fff"; // White background when not hovered
                        }}
                    >
                        <img
                            src="goolge.png"
                            alt="Google Logo"
                            style={{ width: "20px", height: "20px", marginRight: "12px" }}
                        />
                        <span style={{ fontWeight: "500" }}>Login with Google</span>
                    </button>

                    {statusMessage && (
                        <p style={{ marginTop: "20px", fontSize: "14px", color: "#555" }}>
                            {statusMessage}
                        </p>
                    )}
                </div>
            </div>
        </div>
        </>
        );
};

const App = () => (
    <GoogleOAuthProvider clientId="247063468079-mq20uk1jrbq5m61e319humb3h7q2b1hk.apps.googleusercontent.com">
        <LoginPage />
    </GoogleOAuthProvider>
);

export default App;
