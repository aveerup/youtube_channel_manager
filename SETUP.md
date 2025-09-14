# Google OAuth 2.0 Full-Stack Setup Instructions

## Prerequisites

1. Create a Google Cloud Project and enable Google OAuth 2.0
2. Get your Google Client ID and Client Secret

## Setup Steps

### 1. Backend Configuration

1. Navigate to the Backend directory:
   ```bash
   cd Backend
   ```

2. Update the `.env` file with your Google OAuth credentials:
   ```env
   PORT=3001
   SESSION_SECRET=your-super-secret-session-key-change-in-production
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   FRONTEND_URL=http://localhost:3000
   ```

3. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Configuration

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Start the React development server:
   ```bash
   npm start
   ```

### 3. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client IDs
5. Set the authorized redirect URIs to:
   - `http://localhost:3001/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## Usage

1. Backend runs on: `http://localhost:3001`
2. Frontend runs on: `http://localhost:3000` (React dev server default)
3. Click "Sign in with Google" to authenticate
4. After successful login, you'll see the user dashboard with profile information

## API Endpoints

- `GET /auth/google` - Initiates Google OAuth flow
- `GET /auth/google/callback` - Handles Google OAuth callback
- `GET /api/user` - Returns authenticated user information
- `GET /auth/logout` - Logs out the user

## Features

- ✅ Google OAuth 2.0 authentication
- ✅ Session-based authentication
- ✅ CORS configured for frontend-backend communication
- ✅ Responsive UI design
- ✅ User profile display
- ✅ Secure logout functionality

## Security Notes

- Sessions are configured with secure defaults
- CORS is properly configured
- Session secret should be changed in production
- Use HTTPS in production and update cookie security settings
