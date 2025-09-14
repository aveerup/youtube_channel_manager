# Full-Stack Google OAuth 2.0 Login System

## Project Structure

```
/
├── Backend/                     # Express.js server
│   ├── index.js                # Main server file with Passport.js setup
│   ├── package.json            # Backend dependencies
│   └── .env                    # Environment variables (needs Google OAuth config)
│
├── frontend/                   # React.js application
│   ├── src/
│   │   ├── App.js             # Main App component with auth state management
│   │   ├── App.css            # Global styles
│   │   └── components/
│   │       ├── LoginScreen.js  # Google login button component
│   │       ├── LoginScreen.css # Login screen styles
│   │       ├── Dashboard.js    # User dashboard after login
│   │       └── Dashboard.css   # Dashboard styles
│   └── package.json           # Frontend dependencies
│
└── SETUP.md                   # Setup instructions
```

## ✅ What's Been Implemented

### Backend Features:
- ✅ Express.js server with Google OAuth 2.0
- ✅ Passport.js with passport-google-oauth20 strategy
- ✅ Session-based authentication with express-session
- ✅ CORS configuration for frontend-backend communication
- ✅ Authentication middleware
- ✅ Protected API routes

### Frontend Features:
- ✅ React application with login/logout flow
- ✅ "Sign in with Google" button with Google branding
- ✅ User dashboard displaying profile information
- ✅ Responsive design
- ✅ Session persistence across page refreshes
- ✅ Axios configured for authenticated requests

### API Endpoints:
- ✅ `GET /auth/google` - Initiates Google OAuth flow
- ✅ `GET /auth/google/callback` - Handles OAuth callback
- ✅ `GET /api/user` - Returns authenticated user data
- ✅ `GET /auth/logout` - Logs out user and destroys session

## 🚀 Getting Started

1. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project and enable Google+ API
   - Create OAuth 2.0 credentials
   - Set redirect URI: `http://localhost:3001/auth/google/callback`

2. **Update Backend Configuration:**
   - Edit `Backend/.env` with your Google OAuth credentials
   - Replace `your-google-client-id` and `your-google-client-secret`

3. **Start the Servers:**
   ```bash
   # Terminal 1 - Backend (runs on port 3001)
   cd Backend
   npm run dev
   
   # Terminal 2 - Frontend (runs on port 3000)
   cd frontend
   npm start
   

The system is now ready for Google OAuth configuration and testing!
