import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signup, checkAdminExists } from '../services/api';
import './AuthPages.css';

function CreateAdminPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: ''
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkingAdmin, setCheckingAdmin] = useState(true);
    const [adminExists, setAdminExists] = useState(false);

    // Check if admin already exists
    useEffect(() => {
        const checkAdmin = async () => {
            try {
                const exists = await checkAdminExists();
                setAdminExists(exists);
                setCheckingAdmin(false);
            } catch (err) {
                console.error('Error checking admin:', err);
                setCheckingAdmin(false);
            }
        };

        checkAdmin();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match!');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Create admin account
            const userData = {
                email: formData.email,
                password: formData.password,
                userType: 'Admin',
                fullName: formData.fullName
            };

            await signup(userData);

            alert('Admin account created successfully! You can now log in.');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Failed to create admin account. Please try again.');
            console.error('Admin creation error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (checkingAdmin) {
        return (
            <div className="auth-page">
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    fontSize: '1.5rem',
                    color: '#667eea'
                }}>
                    Checking admin status...
                </div>
            </div>
        );
    }

    if (adminExists) {
        return (
            <div className="auth-page">
                <a href="#main-content" className="skip-link">Skip to main content</a>

                <div className="auth-container">
                    <header className="auth-header">
                        <h1>Admin Setup Complete</h1>
                    </header>

                    <main id="main-content">
                        <div style={{
                            background: '#e6f7ff',
                            border: '1px solid #91d5ff',
                            padding: '2rem',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#0050b3' }}>
                                An admin account already exists for this platform.
                            </p>
                            <p style={{ color: '#595959' }}>
                                If you need to create additional admin accounts, please log in as an existing admin.
                            </p>
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Link to="/login" style={{
                                display: 'inline-block',
                                background: '#667eea',
                                color: 'white',
                                padding: '0.75rem 2rem',
                                borderRadius: '8px',
                                textDecoration: 'none',
                                fontWeight: '600'
                            }}>
                                Go to Login
                            </Link>
                        </div>
                    </main>

                    <footer className="auth-footer">
                        <p><Link to="/">← Back to Home</Link></p>
                    </footer>
                </div>
            </div>
        );
    }

    return (
        <div className="auth-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <div className="auth-container">
                <header className="auth-header">
                    <h1>Create Admin Account</h1>
                    <p>Set up the first administrator for this platform</p>
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
                    <form onSubmit={handleSubmit} className="auth-form" aria-label="Create admin form">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name <span aria-label="required">*</span></label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                placeholder="Enter your full name"
                                disabled={loading}
                            />
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
                                placeholder="admin@example.com"
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
                                minLength="6"
                                placeholder="At least 6 characters"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password <span aria-label="required">*</span></label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                aria-required="true"
                                placeholder="Re-enter your password"
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? 'Creating Admin Account...' : 'Create Admin Account'}
                        </button>
                    </form>
                </main>

                <footer className="auth-footer">
                    <p><Link to="/">← Back to Home</Link></p>
                </footer>
            </div>
        </div>
    );
}

export default CreateAdminPage;