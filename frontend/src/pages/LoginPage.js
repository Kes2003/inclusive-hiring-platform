import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/api';
import './AuthPages.css';

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        userType: 'Job Seeker'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setError('');

        try {
            // Call API
            const response = await login(formData);

            console.log('Login successful:', response);
            alert(`Welcome back! Logged in as ${formData.userType}`);

            // Navigate to appropriate dashboard
            if (formData.userType === 'Job Seeker') {
                navigate('/job-seeker-dashboard');
            } else if (formData.userType === 'Employer') {
                navigate('/employer-dashboard');
            } else {
                navigate('/admin-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <div className="auth-container login-container">
                <header className="auth-header">
                    <h1>Welcome Back!</h1>
                    <p>Log in to your account</p>
                </header>

                {error && (
                    <div
                        role="alert"
                        aria-live="polite"
                        style={{
                            background: '#fee',
                            border: '1px solid #fcc',
                            padding: '1rem',
                            borderRadius: '8px',
                            color: '#c33',
                            marginBottom: '1rem'
                        }}
                    >
                        {error}
                    </div>
                )}

                <main id="main-content">
                    <form onSubmit={handleSubmit} className="auth-form" aria-label="Login form">
                        <div className="form-group">
                            <label htmlFor="userType">I am a: <span aria-label="required">*</span></label>
                            <select
                                id="userType"
                                name="userType"
                                value={formData.userType}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                disabled={loading}
                            >
                                <option value="Job Seeker">Job Seeker</option>
                                <option value="Employer">Employer</option>
                                <option value="Admin">Admin</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address <span aria-label="required">*</span></label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                placeholder="your.email@example.com"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Password <span aria-label="required">*</span></label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? 'Logging in...' : 'Log In'}
                        </button>
                    </form>
                </main>

                <footer className="auth-footer">
                    <p>Don't have an account? <Link to="/">Sign up here</Link></p>
                </footer>
            </div>
        </div>
    );
}

export default LoginPage;