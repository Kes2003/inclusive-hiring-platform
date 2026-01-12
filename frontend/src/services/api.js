// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'https://inclusive-hiring-platform.onrender.com/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
    };
};

// ============= AUTH API =============

export const signup = async (userData) => {
    const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
    }

    // Save token to localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userType', data.userType);

    return data;
};

export const login = async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    // Save token to localStorage
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userType', data.userType);

    return data;
};

export const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userType');
};

export const getUserProfile = async (userId) => {
    const response = await fetch(`${API_URL}/auth/profile/${userId}`, {
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
    }

    return data;
};

export const getEmployerProfile = async (userId) => {
    const response = await fetch(`${API_URL}/auth/profile/${userId}`, {
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch profile');
    }

    return data;
};

// ============= JOBS API =============

export const getAllJobs = async () => {
    const response = await fetch(`${API_URL}/jobs`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
    }

    return data.jobs;
};

export const getJobById = async (jobId) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job');
    }

    return data.job;
};

export const postJob = async (jobData) => {
    const response = await fetch(`${API_URL}/jobs`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(jobData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to post job');
    }

    return data;
};

export const getEmployerJobs = async (employerId) => {
    const response = await fetch(`${API_URL}/jobs/employer/${employerId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch employer jobs');
    }

    return data.jobs;
};

export const deleteJob = async (jobId) => {
    const response = await fetch(`${API_URL}/jobs/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete job');
    }

    return data;
};

// ============= APPLICATIONS API =============

export const applyForJob = async (jobSeekerId, jobId) => {
    const response = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ jobSeekerId, jobId })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to apply for job');
    }

    return data;
};

export const getJobSeekerApplications = async (jobSeekerId) => {
    const response = await fetch(`${API_URL}/applications/job-seeker/${jobSeekerId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
    }

    return data.applications;
};

export const getJobApplications = async (jobId) => {
    const response = await fetch(`${API_URL}/applications/job/${jobId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch job applications');
    }

    return data.applications;
};

export const getEmployerApplications = async (employerId) => {
    const response = await fetch(`${API_URL}/applications/employer/${employerId}`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch applications');
    }

    return data.applications;
};

export const updateApplicationStatus = async (applicationId, status) => {
    const response = await fetch(`${API_URL}/applications/${applicationId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status })
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to update application');
    }

    return data;
};

export const getAllApplications = async () => {
    const response = await fetch(`${API_URL}/applications/all`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch all applications');
    }

    return data.applications;
};
// ============= ADMIN API =============

export const getAllUsers = async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
    }

    return data.users;
};

export const getAllJobsAdmin = async () => {
    const response = await fetch(`${API_URL}/admin/jobs`, {
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch jobs');
    }

    return data.jobs;
};

export const getAdminStats = async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch stats');
    }

    return data.stats;
};

export const deleteUser = async (userId) => {
    const response = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete user');
    }

    return data;
};

export const deleteJobAdmin = async (jobId) => {
    const response = await fetch(`${API_URL}/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to delete job');
    }

    return data;
};

export const getRecentActivity = async () => {
    const response = await fetch(`${API_URL}/admin/activity`, {
        headers: getAuthHeaders()
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch activity');
    }

    return data.activities;
};
// CREATE ADMIN ACCOUNT
export const createAdmin = async (adminData) => {
    const response = await fetch(`${API_URL}/admin/create-admin`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(adminData)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
    }

    return data;
};

// CHECK IF ADMIN EXISTS
export const checkAdminExists = async () => {
    const response = await fetch(`${API_URL}/admin/check-admin-exists`);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Failed to check admin status');
    }

    return data.adminExists;
};