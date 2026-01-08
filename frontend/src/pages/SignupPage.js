import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { signup } from '../services/api';
import './AuthPages.css';

function SignupPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const userType = location.state?.userType || 'Job Seeker';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        // Job Seeker specific fields
        phone: '',
        skills: '',
        disabilityInfo: '',
        // Employer specific fields
        companyName: '',
        companySize: '',
        industry: ''
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

        // Basic validation
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
            // Prepare data for API
            const userData = {
                email: formData.email,
                password: formData.password,
                userType: userType,
                fullName: formData.fullName
            };

            // Add user-type-specific fields
            if (userType === 'Job Seeker') {
                userData.phone = formData.phone;
                userData.skills = formData.skills;
                userData.disabilityInfo = formData.disabilityInfo;
            } else if (userType === 'Employer') {
                userData.companyName = formData.companyName;
                userData.companySize = formData.companySize;
                userData.industry = formData.industry;
            }

            // Call API
            const response = await signup(userData);

            console.log('Signup successful:', response);
            alert(`Welcome! Account created successfully as ${userType}`);

            // Navigate to appropriate dashboard
            if (userType === 'Job Seeker') {
                navigate('/job-seeker-dashboard');
            } else {
                navigate('/employer-dashboard');
            }
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
            console.error('Signup error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <div className="auth-container">
                <header className="auth-header">
                    <h1>Create Your Account</h1>
                    <p>Signing up as: <strong>{userType}</strong></p>
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
                    <form onSubmit={handleSubmit} className="auth-form" aria-label="Signup form">
                        {/* Common Fields */}
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
                                aria-describedby="fullName-hint"
                            />
                            <span id="fullName-hint" className="sr-only">Enter your complete legal name</span>
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
                                aria-describedby="email-hint"
                            />
                            <span id="email-hint" className="sr-only">Enter a valid email address</span>
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
                                aria-describedby="password-hint"
                            />
                            <span id="password-hint" className="sr-only">Password must be at least 6 characters long</span>
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
                                aria-describedby="confirmPassword-hint"
                            />
                            <span id="confirmPassword-hint" className="sr-only">Re-enter your password to confirm</span>
                        </div>

                        {/* Job Seeker Specific Fields */}
                        {userType === 'Job Seeker' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="phone">Phone Number <span aria-label="required">*</span></label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        aria-required="true"
                                        placeholder="+1 (555) 123-4567"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="skills">Skills & Qualifications <span aria-label="required">*</span></label>
                                    <textarea
                                        id="skills"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleChange}
                                        required
                                        aria-required="true"
                                        rows="4"
                                        placeholder="List your skills, experience, and qualifications"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="disabilityInfo">Accessibility Needs (Optional)</label>
                                    <textarea
                                        id="disabilityInfo"
                                        name="disabilityInfo"
                                        value={formData.disabilityInfo}
                                        onChange={handleChange}
                                        rows="3"
                                        placeholder="Any accessibility accommodations you may need"
                                        disabled={loading}
                                        aria-describedby="disabilityInfo-hint"
                                    />
                                    <span id="disabilityInfo-hint" className="sr-only">This information helps us match you with suitable opportunities</span>
                                </div>
                            </>
                        )}

                        {/* Employer Specific Fields */}
                        {userType === 'Employer' && (
                            <>
                                <div className="form-group">
                                    <label htmlFor="companyName">Company Name <span aria-label="required">*</span></label>
                                    <input
                                        type="text"
                                        id="companyName"
                                        name="companyName"
                                        value={formData.companyName}
                                        onChange={handleChange}
                                        required
                                        aria-required="true"
                                        placeholder="Your company name"
                                        disabled={loading}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="companySize">Company Size <span aria-label="required">*</span></label>
                                    <select
                                        id="companySize"
                                        name="companySize"
                                        value={formData.companySize}
                                        onChange={handleChange}
                                        required
                                        aria-required="true"
                                        disabled={loading}
                                    >
                                        <option value="">Select company size</option>
                                        <option value="1-10">1-10 employees</option>
                                        <option value="11-50">11-50 employees</option>
                                        <option value="51-200">51-200 employees</option>
                                        <option value="201-500">201-500 employees</option>
                                        <option value="500+">500+ employees</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="industry">Industry <span aria-label="required">*</span></label>
                                    <input
                                        type="text"
                                        id="industry"
                                        name="industry"
                                        value={formData.industry}
                                        onChange={handleChange}
                                        required
                                        aria-required="true"
                                        placeholder="e.g., Technology, Healthcare, Finance"
                                        disabled={loading}
                                    />
                                </div>
                            </>
                        )}

                        <button
                            type="submit"
                            className="submit-button"
                            disabled={loading}
                            aria-busy={loading}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>
                </main>

                <footer className="auth-footer">
                    <p>Already have an account? <Link to="/login">Log in here</Link></p>
                    <p><Link to="/">← Back to Home</Link></p>
                </footer>
            </div>
        </div>
    );
}

export default SignupPage;