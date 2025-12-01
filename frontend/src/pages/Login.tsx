import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { apiService } from '../services/api';
import { loginSuccess, loginFailure, setLoading } from '../store/authSlice';
import { RootState } from '../store';
import './Login.css';

export const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { loading, error } = useSelector((state: RootState) => state.auth);

    const [isRegistering, setIsRegistering] = useState(false);

    console.log('Login Component Render:', { loading, error, isRegistering });

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

        // Bypass auth for testing
        // try {
        //     let response;
        //     if (isRegistering) {
        //         response = await apiService.register(formData.email, formData.password, formData.username);
        //     } else {
        //         // Using username field as identifier for login
        //         response = await apiService.login(formData.username, formData.password);
        //     }

        //     dispatch(loginSuccess({ user: response.user, token: response.token }));
        //     navigate('/');
        // Mock Login Success
        dispatch(loginSuccess({
            user: {
                userId: 'mock-id',
                username: formData.username || 'Guest',
                displayName: formData.username || 'Guest',
                bio: 'Mock Bio',
                avatar: '',
                totalGames: 0,
                totalWins: 0,
                eloRating: 1200,
                joinedAt: new Date()
            },
            token: 'mock-token'
        }));
        navigate('/');
    };

    return (
        <div className="login-page">
            {/* 🟢 Layer 1: Background Root */}
            <div className="layer-background" style={{ backgroundImage: "url('/assets/login/bg.jpg')" }}></div>

            {/* 🟡 Layer 2: Modal Container Frame */}
            <div className="layer-modal-frame" style={{ backgroundImage: "url('/assets/login/modal_frame.jpg')" }}>

                {/* 🔴 Layer 4: VFX Overlay (Aura around frame) */}
                <div className="aura-effect"></div>

                {/* 🟠 Layer 3: Interactive UI Elements */}
                <div className="layer-interactive">
                    <form className="login-form" onSubmit={handleSubmit}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px', textShadow: '0 0 10px #fff' }}>
                            {isRegistering ? 'REGISTER' : 'LOGIN'}
                        </h2>

                        {error && <div className="error-message" style={{ color: '#ff4444', textAlign: 'center' }}>{error}</div>}

                        <input
                            className="login-input"
                            name="username"
                            placeholder={isRegistering ? "Username" : "Username / Email"}
                            value={formData.username}
                            onChange={handleChange}
                            required
                        />

                        <input
                            className="login-input"
                            name="password"
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />

                        {isRegistering && (
                            <input
                                className="login-input"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        )}

                        <button type="submit" className="login-button" disabled={loading}>
                            {loading ? 'PROCESSING...' : (isRegistering ? 'REGISTER' : 'LOGIN')}
                        </button>

                        <div className="login-links">
                            <a onClick={() => setIsRegistering(!isRegistering)}>
                                {isRegistering ? 'Back to Login' : 'Create Account'}
                            </a>
                            {!isRegistering && <a>Forgot Password?</a>}
                        </div>

                        <div className="social-icons">
                            <div className="social-icon" title="Google">G</div>
                            <div className="social-icon" title="Discord">D</div>
                        </div>
                    </form>
                </div>
            </div>

            {/* 🔴 Layer 4: VFX Overlay (Global Fog) */}
            <div className="layer-vfx">
                <div className="fog-layer"></div>
            </div>
        </div>
    );
};
