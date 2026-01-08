import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';

function HomePage() {
    const navigate = useNavigate();

    const handleUserTypeSelection = (userType) => {
        // Navigate to signup page with user type
        navigate('/signup', { state: { userType } });
    };

    return (
        <div className="home-page">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <header className="app-header" role="banner">
                <h1>Inclusive Hiring Platform</h1>
                <p>Connecting talented individuals with inclusive employers</p>
            </header>

            <main id="main-content" className="home-container" role="main">
                <h2>Welcome! Please select your role:</h2>

                <div className="button-container" role="group" aria-label="User type selection">
                    <button
                        className="user-type-button job-seeker"
                        onClick={() => handleUserTypeSelection('Job Seeker')}
                        aria-label="Select Job Seeker - Find accessible job opportunities"
                    >
                        <div className="button-content">
                            <span className="icon" aria-hidden="true">👤</span>
                            <h3>I'm a Job Seeker</h3>
                            <p>Find accessible job opportunities</p>
                        </div>
                    </button>

                    <button
                        className="user-type-button employer"
                        onClick={() => handleUserTypeSelection('Employer')}
                        aria-label="Select Employer - Post jobs and find great candidates"
                    >
                        <div className="button-content">
                            <span className="icon" aria-hidden="true">🏢</span>
                            <h3>I'm an Employer</h3>
                            <p>Post jobs and find great candidates</p>
                        </div>
                    </button>
                </div>
            </main>

            <footer className="app-footer" role="contentinfo">
                <p>© 2025 Inclusive Hiring Platform - Accessibility First</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
                    <Link to="/create-admin" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'underline' }}>
                        Admin Setup
                    </Link>
                </p>
            </footer>
        </div>
    );
}

export default HomePage;