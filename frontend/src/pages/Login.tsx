import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '../services/api';
import { loginSuccess, loginFailure, setLoading } from '../store/authSlice';
import { RootState } from '../store';

export const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [isRegistering, setIsRegistering] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(setLoading(true));

        try {
            let response;
            if (isRegistering) {
                response = await apiService.register(formData.email, formData.password, formData.username);
            } else {
                // For login, the API expects email, but our UI asks for username/email. 
                // Assuming the backend handles username or email, or we strictly use email for now.
                // Based on api.ts, login takes email and password.
                // Let's assume the user enters email in the username field for login if it's not separate, 
                // or we should update the UI to ask for email.
                // For now, I'll pass the username field as email if it looks like an email, otherwise... 
                // Actually, let's just use the email field if registering, and for login let's assume the input is email.
                // Wait, the mock had 'username' placeholder. 
                // Let's check the API again. api.ts says `login(email, password)`.
                // So for login, we should probably ask for email.
                // But the mock UI had "Username" input.
                // I will update the UI to ask for Email/Username or just Email.
                // Let's use the 'email' field for login as well if we want to be safe, or assume username is email.
                // To match the mock flow where 'username' was used, I'll use formData.username as email for now 
                // OR I should add an email input for login too?
                // The mock had:
                // <input name="username" placeholder="Username" required />
                // <input name="password" ... />
                // {isRegistering && <input name="email" ... />}

                // If I change this too much, E2E might break if it relies on specific selectors.
                // E2E fills 'Username', 'Password', 'Email' (only if registering).
                // If I want to use real API, I need to send what the API expects.
                // If API expects email for login, I should probably use the email field or treat username as email.
                // Let's try to use the 'username' input value as the first arg to login (which is named email in api.ts).
                response = await apiService.login(formData.username, formData.password);
            }

            dispatch(loginSuccess({ user: response.user, token: response.token }));
            navigate('/');
        } catch (err: any) {
            console.error('Auth error:', err);
            dispatch(loginFailure(err.response?.data?.message || 'Authentication failed'));
        }
    };

    return (
        <div className="login-page">
            <h1>{isRegistering ? 'Register' : 'Login'}</h1>
            {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}
            <form onSubmit={handleSubmit}>
                {/* For Login, we use this as the identifier (Email/Username) */}
                <input
                    name="username"
                    placeholder={isRegistering ? "Username" : "Email"}
                    value={formData.username}
                    onChange={handleChange}
                    required
                />
                <input
                    name="password"
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                {isRegistering && (
                    <input
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                )}
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : (isRegistering ? 'Register' : 'Login')}
                </button>
                <button type="button" onClick={() => setIsRegistering(!isRegistering)}>
                    {isRegistering ? 'Switch to Login' : 'Switch to Register'}
                </button>
            </form>
        </div>
    );
};
