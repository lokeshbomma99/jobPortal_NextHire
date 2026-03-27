# 🚀 JobPortal - Full-Stack MERN Application

A complete Job Portal built with MongoDB, Express, React (Vite), and Node.js.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS v4, Socket.io-client, Axios
- **Backend**: Node.js, Express, MongoDB (Mongoose), Socket.io, JWT
- **Storage**: Cloudinary (resumes + avatars)
- **Email**: Nodemailer (Gmail SMTP)

## Features
- ✅ JWT Auth (Seeker / Employer / Admin roles)
- ✅ Post, Edit, Delete Jobs
- ✅ Search & Filter Jobs (type, location, experience, category)
- ✅ Apply to Jobs with Cover Letter
- ✅ Save / Bookmark Jobs
- ✅ Real-time Chat (Socket.io) with typing indicators
- ✅ Real-time Notifications
- ✅ Resume & Avatar Upload (Cloudinary)
- ✅ Email notifications (Nodemailer)
- ✅ Employer Dashboard (manage posts & applicants)
- ✅ Seeker Dashboard (track applications)
- ✅ Admin Dashboard (manage users & stats)
- ✅ Mobile-first responsive design

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Configure server environment
cd server
cp .env.example .env
# Edit .env with your MongoDB URI, Cloudinary keys, SMTP credentials

# 3. Run both server + client
cd ..
npm run dev
```

## Environment Variables (server/.env)

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT tokens |
| `JWT_EXPIRE` | Token expiration (default: 7d) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `EMAIL_HOST` | SMTP host (default: smtp.gmail.com) |
| `EMAIL_PORT` | SMTP port (default: 587) |
| `EMAIL_USER` | Gmail address for emails |
| `EMAIL_PASS` | Gmail app password |
| `EMAIL_FROM` | From email address |
| `CLIENT_URL` | Frontend URL (default: http://localhost:5173) |

## Ports
- Frontend: http://localhost:5173 (or 5174 if 5173 is busy)
- Backend API: http://localhost:5000/api

## Project Structure

```
job-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── lib/          # API and socket utilities
│   │   ├── pages/        # Page components
│   │   └── styles/       # Global styles
│   └── public/           # Static assets
├── server/                # Express backend
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   └── utils/           # Utility functions
└── package.json         # Root package.json
```

## Available Scripts

```bash
# Install all dependencies
npm run install:all

# Run both frontend and backend
npm run dev

# Run backend only
npm run dev:server

# Run frontend only
npm run dev:client

# Build frontend for production
npm run build
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/password` - Update password

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/featured` - Get featured jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (employer only)
- `PUT /api/jobs/:id` - Update job (employer only)
- `DELETE /api/jobs/:id` - Delete job (employer only)
- `POST /api/jobs/:id/apply` - Apply to job
- `POST /api/jobs/:id/save` - Save/unsave job

### Applications
- `GET /api/jobs/seeker/applications` - Get seeker's applications
- `GET /api/jobs/employer/applications` - Get employer's applications
- `PUT /api/jobs/:jobId/applications/:appId/status` - Update application status

### Chat
- `GET /api/chat` - Get conversations
- `POST /api/chat` - Create conversation
- `GET /api/chat/:id/messages` - Get messages
- `POST /api/chat/:id/messages` - Send message

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read

### Admin
- `GET /api/admin/stats` - Get platform statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/toggle` - Toggle user status
- `PUT /api/admin/jobs/:id/feature` - Toggle job featured status

## Troubleshooting

### CORS Errors
If you see CORS errors, make sure:
1. The backend is running on port 5000
2. The frontend is running on port 5173 or 5174
3. Both ports are allowed in `server/index.js`

### Socket.io Connection Issues
- Ensure the backend server is running
- Check that the `CLIENT_URL` in `.env` matches your frontend URL
- Verify proxy settings in `client/vite.config.js`

### Database Connection
- Verify your `MONGO_URI` is correct
- Ensure your IP is whitelisted in MongoDB Atlas
- Check network connectivity

## License
MIT

## Support
For issues and questions, please open an issue on GitHub.
