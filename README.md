# Inclusive Hiring Platform

A full-stack web application designed to connect talented individuals with disabilities to inclusive employers. Built with accessibility-first principles following WCAG 2.1 AA standards.

![Platform Banner](https://via.placeholder.com/1200x300/667eea/ffffff?text=Inclusive+Hiring+Platform)

## 🌟 Overview

The Inclusive Hiring Platform bridges the gap between job seekers with disabilities and employers committed to creating inclusive workplaces. Every feature is designed with accessibility in mind, ensuring equal access for all users.

---

## ✨ Key Features

### For Job Seekers 👤
- **Accessible Job Search** - Browse job opportunities with detailed accessibility features
- **Easy Application Process** - Apply to jobs with a single click
- **Application Tracking** - Monitor application status (Pending, Accepted, Rejected)
- **Profile Management** - Showcase skills, experience, and accessibility needs
- **Real-time Updates** - View application statistics and status changes

### For Employers 🏢
- **Job Posting System** - Post jobs with detailed accessibility accommodations
- **Application Management** - Review applicant profiles, skills, and requirements
- **Candidate Communication** - Direct email contact with applicants
- **Accept/Reject Workflow** - Streamlined application review process
- **Analytics Dashboard** - Track job postings and application metrics

### For Administrators 🔐
- **Platform Oversight** - Monitor all users, jobs, and applications
- **User Management** - View and manage all platform users
- **Job Moderation** - Review and remove inappropriate job postings
- **Analytics & Reporting** - Platform-wide statistics and activity tracking
- **Admin Account Creation** - Create additional administrator accounts

---

## 🎯 Accessibility Features (WCAG 2.1 AA Compliant)

✅ **Keyboard Navigation** - Full site navigation without a mouse  
✅ **Screen Reader Support** - Proper ARIA labels and semantic HTML  
✅ **Skip Links** - Quick navigation to main content  
✅ **High Contrast** - Sufficient color contrast ratios (4.5:1 minimum)  
✅ **Focus Indicators** - Clear visual focus states for all interactive elements  
✅ **Form Labels** - All inputs properly labeled and described  
✅ **Error Handling** - Accessible error messages with screen reader announcements  
✅ **Responsive Design** - Works on all devices and screen sizes  
✅ **Reduced Motion** - Respects user's motion preferences  

---

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **React Router** - Client-side routing
- **CSS3** - Custom styling with accessibility focus
- **Fetch API** - HTTP requests to backend

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **SQLite3** - Lightweight database
- **bcrypt** - Password hashing
- **JSON Web Tokens (JWT)** - Authentication
- **CORS** - Cross-origin resource sharing

### Database Schema
- **users** - User accounts (Job Seekers, Employers, Admins)
- **job_seekers** - Job seeker profiles
- **employers** - Employer/company information
- **jobs** - Job postings with accessibility features
- **applications** - Job applications and status tracking

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Clone the Repository
```bash
git clone https://github.com/yourusername/inclusive-hiring-platform.git
cd inclusive-hiring-platform
```

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
Server runs on: `http://localhost:5000`

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Application runs on: `http://localhost:3000`

---

## 🔐 Default Admin Credentials

To create the first admin account, visit:
```
http://localhost:3000/create-admin
```

Or use the provided script:
```bash
cd backend
node createAdmin.js
```

**Default Admin Login:**
- Email: `admin@platform.com`
- Password: `admin123`

⚠️ **Important:** Change these credentials in production!

---

## 📁 Project Structure
```
inclusive-hiring-platform/
│
├── frontend/                      # React application
│   ├── public/                    # Static files
│   ├── src/
│   │   ├── pages/                 # Page components
│   │   │   ├── HomePage.js
│   │   │   ├── SignupPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── JobSeekerDashboard.js
│   │   │   ├── EmployerDashboard.js
│   │   │   ├── AdminDashboard.js
│   │   │   └── CreateAdminPage.js
│   │   ├── services/              # API service layer
│   │   │   └── api.js
│   │   ├── App.js                 # Main app component
│   │   └── App.css                # Global styles
│   └── package.json
│
├── backend/                       # Node.js server
│   ├── routes/                    # API routes
│   │   ├── auth.js                # Authentication routes
│   │   ├── jobs.js                # Job management routes
│   │   ├── applications.js        # Application routes
│   │   └── admin.js               # Admin routes
│   ├── database/                  # SQLite database files
│   │   └── hiring_platform.db
│   ├── database.js                # Database configuration
│   ├── server.js                  # Express server
│   ├── createAdmin.js             # Admin creation script
│   └── package.json
│
└── README.md                      # This file
```

---

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile/:userId` - Get user profile

### Jobs
- `GET /api/jobs` - Get all active jobs
- `GET /api/jobs/:jobId` - Get specific job
- `POST /api/jobs` - Create job posting (Employer only)
- `GET /api/jobs/employer/:employerId` - Get employer's jobs
- `DELETE /api/jobs/:jobId` - Delete job

### Applications
- `POST /api/applications` - Submit job application
- `GET /api/applications/job-seeker/:jobSeekerId` - Get job seeker's applications
- `GET /api/applications/employer/:employerId` - Get employer's applications
- `PUT /api/applications/:applicationId` - Update application status
- `GET /api/applications/all` - Get all applications (Admin only)

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/jobs` - Get all jobs
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/activity` - Get recent activity
- `POST /api/admin/create-admin` - Create new admin
- `DELETE /api/admin/users/:userId` - Delete user
- `DELETE /api/admin/jobs/:jobId` - Delete job

---

## 🎨 User Roles & Permissions

| Feature | Job Seeker | Employer | Admin |
|---------|-----------|----------|-------|
| Browse Jobs | ✅ | ✅ | ✅ |
| Apply to Jobs | ✅ | ❌ | ❌ |
| Post Jobs | ❌ | ✅ | ❌ |
| Manage Applications | ❌ | ✅ | ✅ |
| View All Users | ❌ | ❌ | ✅ |
| Delete Users/Jobs | ❌ | ❌ | ✅ |
| Platform Statistics | ❌ | ❌ | ✅ |

---

## 🔒 Security Features

- **Password Hashing** - bcrypt with salt rounds
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Server-side validation for all inputs
- **SQL Injection Prevention** - Parameterized queries
- **CORS Protection** - Controlled cross-origin requests
- **Session Management** - Secure token storage in localStorage

---

## 🌐 Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

---

## 📊 Database Schema

### users
```sql
id, email, password, user_type, created_at
```

### job_seekers
```sql
id, user_id, full_name, phone, skills, disability_info, resume_path
```

### employers
```sql
id, user_id, full_name, company_name, company_size, industry
```

### jobs
```sql
id, employer_id, title, location, job_type, salary, 
description, accessibility_features, status, created_at
```

### applications
```sql
id, job_seeker_id, job_id, status, applied_at
```

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration (Job Seeker & Employer)
- [ ] User login/logout
- [ ] Job posting creation
- [ ] Job application submission
- [ ] Application status updates
- [ ] Admin dashboard access
- [ ] Keyboard navigation
- [ ] Screen reader compatibility

### Future Testing
- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Cypress
- Accessibility audits with axe-core

---

## 🚧 Known Issues & Limitations

- Resume upload not yet implemented
- Email notifications not configured
- No password reset functionality
- Limited search/filter options for jobs
- Single database instance (not production-ready)

---

## 🔮 Future Enhancements

### Phase 1 - Core Improvements
- [ ] Resume/CV upload and storage
- [ ] Advanced job search filters
- [ ] Email notification system
- [ ] Password reset functionality
- [ ] Profile editing for all users

### Phase 2 - Enhanced Features
- [ ] Job categories and tags
- [ ] Saved jobs feature
- [ ] Company profile pages
- [ ] Application deadlines
- [ ] Interview scheduling

### Phase 3 - Advanced Features
- [ ] Real-time notifications (WebSockets)
- [ ] In-app messaging system
- [ ] Video interview integration
- [ ] Analytics dashboard with charts
- [ ] Multi-language support

### Phase 4 - Production Ready
- [ ] PostgreSQL migration
- [ ] Redis caching
- [ ] API rate limiting
- [ ] Comprehensive error logging
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Cloud deployment (AWS/Azure/Heroku)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Anthony**

- Built with ❤️ and accessibility in mind
- Learning full-stack web development from scratch

---

## 🙏 Acknowledgments

- WCAG 2.1 Guidelines for accessibility standards
- React community for excellent documentation
- Node.js and Express.js communities
- All contributors and testers

---

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Contact: [your-email@example.com]

---

## ⭐ Star This Repository

If you find this project helpful, please consider giving it a star!

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Status:** ✅ Fully Functional
