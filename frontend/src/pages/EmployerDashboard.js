import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    postJob,
    getEmployerJobs,
    getEmployerApplications,
    updateApplicationStatus,
    logout
} from '../services/api';
import './Dashboard.css';

function EmployerDashboard() {
    const navigate = useNavigate();

    const [jobPostings, setJobPostings] = useState([]);
    const [applications, setApplications] = useState([]);
    const [applicationStatuses, setApplicationStatuses] = useState({});
    const [showPostJobForm, setShowPostJobForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [employerId, setEmployerId] = useState(null);

    const [newJob, setNewJob] = useState({
        title: '',
        location: '',
        jobType: 'Full-time',
        salary: '',
        description: '',
        accessibility: ''
    });

    // Get user ID from localStorage
    const userId = localStorage.getItem('userId');

    // Fetch employer profile and data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                // First, get the employer profile to get the actual employer_id
                const profileResponse = await fetch(`http://localhost:5000/api/auth/profile/${userId}`);
                const profileData = await profileResponse.json();

                if (profileData.profile && profileData.profile.id) {
                    const empId = profileData.profile.id;
                    setEmployerId(empId);

                    // Now fetch employer's jobs using the correct employer_id
                    const jobsData = await getEmployerJobs(empId);
                    setJobPostings(jobsData);

                    // Fetch applications for this employer
                    const appsData = await getEmployerApplications(empId);
                    setApplications(appsData);
                }

                setLoading(false);
            } catch (err) {
                setError('Failed to load data. Please try again.');
                console.error('Error fetching data:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleStatusChange = async (applicationId, newStatus) => {
        try {
            await updateApplicationStatus(applicationId, newStatus);

            // Update local state
            setApplicationStatuses({
                ...applicationStatuses,
                [applicationId]: newStatus
            });

            // Update applications list
            const updatedApplications = applications.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            );
            setApplications(updatedApplications);

            if (newStatus === 'Accepted') {
                alert('Applicant accepted! You can now schedule an interview.');
            } else if (newStatus === 'Rejected') {
                alert('Applicant rejected.');
            }
        } catch (err) {
            alert(err.message || 'Failed to update status. Please try again.');
            console.error('Error updating status:', err);
        }
    };

    const handlePostJob = async (e) => {
        e.preventDefault();

        if (!employerId) {
            alert('Employer ID not found. Please try logging in again.');
            return;
        }

        try {
            const jobData = {
                employerId: employerId,
                title: newJob.title,
                location: newJob.location,
                jobType: newJob.jobType,
                salary: newJob.salary,
                description: newJob.description,
                accessibility: newJob.accessibility
            };

            await postJob(jobData);

            alert('Job posted successfully!');
            setShowPostJobForm(false);

            // Reset form
            setNewJob({
                title: '',
                location: '',
                jobType: 'Full-time',
                salary: '',
                description: '',
                accessibility: ''
            });

            // Refresh job listings
            const jobsData = await getEmployerJobs(employerId);
            setJobPostings(jobsData);
        } catch (err) {
            alert(err.message || 'Failed to post job. Please try again.');
            console.error('Error posting job:', err);
        }
    };

    const handleJobFormChange = (e) => {
        setNewJob({
            ...newJob,
            [e.target.name]: e.target.value
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <div className="dashboard">
                <div
                    role="status"
                    aria-live="polite"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100vh',
                        fontSize: '1.5rem',
                        color: '#667eea'
                    }}
                >
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard">
            <a href="#main-content" className="skip-link">Skip to main content</a>

            <header className="dashboard-header" role="banner">
                <div className="header-content">
                    <h1>Employer Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="logout-button"
                        aria-label="Log out of your account"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main id="main-content" className="dashboard-main" role="main">
                <section className="welcome-section">
                    <h2>Welcome back, Employer!</h2>
                    <p>Manage your job postings and review applications from talented candidates.</p>
                </section>

                {error && (
                    <div
                        role="alert"
                        aria-live="assertive"
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

                <section className="stats-section" aria-label="Dashboard statistics">
                    <div className="stat-card">
                        <h3>{jobPostings.length}</h3>
                        <p>Active Job Postings</p>
                    </div>
                    <div className="stat-card">
                        <h3>{applications.length}</h3>
                        <p>Total Applications</p>
                    </div>
                    <div className="stat-card">
                        <h3>{applications.filter(app => app.status === 'Accepted').length}</h3>
                        <p>Accepted Candidates</p>
                    </div>
                </section>

                {/* Post New Job Button */}
                <section className="actions-section">
                    <button
                        onClick={() => setShowPostJobForm(!showPostJobForm)}
                        className="primary-button"
                        aria-expanded={showPostJobForm}
                        aria-controls="post-job-form"
                    >
                        {showPostJobForm ? 'Cancel' : '+ Post New Job'}
                    </button>
                </section>

                {/* Post Job Form */}
                {showPostJobForm && (
                    <section className="post-job-section" id="post-job-form" aria-labelledby="post-job-heading">
                        <h2 id="post-job-heading">Post a New Job</h2>
                        <form onSubmit={handlePostJob} className="post-job-form" aria-label="Post new job form">
                            <div className="form-group">
                                <label htmlFor="title">Job Title <span aria-label="required">*</span></label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={newJob.title}
                                    onChange={handleJobFormChange}
                                    required
                                    aria-required="true"
                                    placeholder="e.g., Senior Software Engineer"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="location">Location <span aria-label="required">*</span></label>
                                <input
                                    type="text"
                                    id="location"
                                    name="location"
                                    value={newJob.location}
                                    onChange={handleJobFormChange}
                                    required
                                    aria-required="true"
                                    placeholder="e.g., Remote, New York, Hybrid"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="jobType">Job Type <span aria-label="required">*</span></label>
                                <select
                                    id="jobType"
                                    name="jobType"
                                    value={newJob.jobType}
                                    onChange={handleJobFormChange}
                                    required
                                    aria-required="true"
                                >
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Contract">Contract</option>
                                    <option value="Internship">Internship</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="salary">Salary Range <span aria-label="required">*</span></label>
                                <input
                                    type="text"
                                    id="salary"
                                    name="salary"
                                    value={newJob.salary}
                                    onChange={handleJobFormChange}
                                    required
                                    aria-required="true"
                                    placeholder="e.g., $60,000 - $80,000"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Job Description <span aria-label="required">*</span></label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={newJob.description}
                                    onChange={handleJobFormChange}
                                    required
                                    aria-required="true"
                                    rows="4"
                                    placeholder="Describe the role, responsibilities, and requirements"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="accessibility">Accessibility Features <span aria-label="required">*</span></label>
                                <textarea
                                    id="accessibility"
                                    name="accessibility"
                                    value={newJob.accessibility}
                                    onChange={handleJobFormChange}
                                    required
                                    aria-required="true"
                                    rows="3"
                                    placeholder="Describe accessibility accommodations and inclusive features"
                                />
                            </div>

                            <button type="submit" className="submit-button">
                                Post Job
                            </button>
                        </form>
                    </section>
                )}

                {/* Job Postings */}
                <section className="jobs-section" aria-labelledby="job-postings-heading">
                    <h2 id="job-postings-heading">Your Job Postings</h2>
                    {jobPostings.length === 0 ? (
                        <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                            You haven't posted any jobs yet. Click "+ Post New Job" to get started!
                        </p>
                    ) : (
                        <div className="jobs-list" role="list">
                            {jobPostings.map(job => (
                                <article key={job.id} className="job-posting-card" role="listitem">
                                    <h3>{job.title}</h3>
                                    <p>Applicants: <strong>{job.applicant_count || 0}</strong></p>
                                    <p>Status: <span className="status-badge">{job.status}</span></p>
                                    <p style={{ color: '#718096', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                        Posted: {new Date(job.created_at).toLocaleDateString()}
                                    </p>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {/* Applications */}
                <section className="applications-section" aria-labelledby="applications-heading">
                    <h2 id="applications-heading">Recent Applications</h2>

                    {applications.length === 0 ? (
                        <p style={{ color: '#718096', fontSize: '1.1rem' }} role="status">
                            No applications yet. Your posted jobs will appear here once candidates apply.
                        </p>
                    ) : (
                        <div className="applicants-list" role="list">
                            {applications.map(applicant => (
                                <article key={applicant.id} className="applicant-card" role="listitem">
                                    <div className="applicant-header">
                                        <h3>{applicant.full_name}</h3>
                                        <span className="applied-for">Applied for: {applicant.job_title}</span>
                                    </div>

                                    <div className="applicant-details">
                                        <p><strong>Email:</strong> {applicant.email}</p>
                                        <p><strong>Phone:</strong> {applicant.phone}</p>
                                        <p><strong>Skills:</strong> {applicant.skills}</p>
                                        <p><strong>Accessibility Needs:</strong> {applicant.disability_info || 'None specified'}</p>
                                        <p><strong>Applied:</strong> {new Date(applicant.applied_at).toLocaleDateString()}</p>
                                        <p><strong>Current Status:</strong> <span className={`status-badge ${applicant.status.toLowerCase()}`}>{applicant.status}</span></p>
                                    </div>

                                    <div className="applicant-actions">
                                        <button
                                            onClick={() => handleStatusChange(applicant.id, 'Accepted')}
                                            className="accept-button"
                                            disabled={applicant.status === 'Accepted'}
                                            aria-label={`Accept ${applicant.full_name}'s application`}
                                        >
                                            {applicant.status === 'Accepted' ? '✓ Accepted' : 'Accept'}
                                        </button>

                                        <button
                                            onClick={() => handleStatusChange(applicant.id, 'Rejected')}
                                            className="reject-button"
                                            disabled={applicant.status === 'Rejected'}
                                            aria-label={`Reject ${applicant.full_name}'s application`}
                                        >
                                            {applicant.status === 'Rejected' ? '✗ Rejected' : 'Reject'}
                                        </button>

                                        <button
                                            className="contact-button"
                                            onClick={() => window.location.href = `mailto:${applicant.email}`}
                                            aria-label={`Contact ${applicant.full_name} via email`}
                                        >
                                            Contact Candidate
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}

export default EmployerDashboard;