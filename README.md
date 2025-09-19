# Full-Stack Google OAuth 2.0 Login System

## ✅ What's Been Implemented

### Backend Features:
- Express.js server with Google OAuth 2.0
- Passport.js with passport-google-oauth20 strategy
- Session-based authentication with express-session
- CORS configuration for frontend-backend communication
- Authentication middleware
- Protected API routes
- Video share from frontend using multer
- Cloudinary as video storage
- Catchy youtube title, description and tags generation for the video
- Fetch and display users youtube channel data and analytics

### Frontend Features:
- React application with login/logout flow
- "Sign in with Google" button with Google branding
- User dashboard displaying profile information
- Responsive design
- Session persistence across page refreshes
- Axios configured for authenticated requests
- Upload page with drag and drop box for video input
- Displays generated title, description and tags for the video
- Scheduler with date-time and timezone selector
- Youtube channel data analysis and Bar chart display of last few months

### API Endpoints:
- ✅ `GET /auth/google` -
-    Initiates Google OAuth flow
- ✅ `GET /auth/google/callback` -
-    Handles OAuth callback
- ✅ `GET /api/user` -
-    Returns authenticated user data
- ✅ `GET /auth/logout` -
-    Logs out user and destroys session
- ✅ `POST /api/upload` -
-    Gets the input video from frontend and uploads it to cloudinary, also generates the initial title, description and tags for the video
- ✅ `POST /api/generate/title` -
-    Used to re-generate title if the user wants to
- ✅ `POST /api/generate/description` -
-    Used to re-generate description if the user wants to
- ✅ `POST /api/generate/keywords` -
-    Used to re-generate keywords/tags if the user wants to
- ✅ `POST /api/youtube/upload` -
-    Upload the video with new title, description and tags to youtube. Along with the publish time.
- ✅ `POST /api/channel/data` -
-    Fetch user's youtube channel data like views, subscribers etc.
- ✅ `POST /api/channel/analytics` -
-    Fetch analytics on the user's youtube channel
- ✅ `POST /api/cancel` -
-    If user doesn't want to continue with the current video upload, then cancels the upload

## 🚀 Getting Started

1. **Configure Google OAuth:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a project and enable Google+ API
   - Create OAuth 2.0 credentials
   - Set redirect URI: `http://localhost:3001/auth/google/callback`

2. **Update Backend Configuration:**
   - Edit `Backend/.env` with your Google OAuth credentials
   - Replace `your-google-client-id` and `your-google-client-secret`

3. **Get other .env variables:**
   - Update `SUPABASE_DB_URL`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `ASSEMBLYAI_API_KEY`, `GEMINI_API_KEY` with your own keys

4. **Set axios default baseurl in app.js frontend**
   - Set axios.default.baseURL = 'https://localhost:3001' (backend server base address)
 
 5. **Set window.location.href in LoginScreen.js**
   - Set window.location.href = 'https://localhost:3001/auth/google'

 6. **Add 'uploads' directory to Backend**
   - Add an empty 'uploads' directory in Backend directory 
 
 8. **Start the Servers:**
   ```bash
   # Terminal 1 - Backend (runs on port 3001)
   cd Backend
   npm install ( when running for the first time)
   npm run dev
   
   # Terminal 2 - Frontend (runs on port 3000)
   cd frontend
   npm install ( when running for the first time)
   npm start
   

The system is now ready for Google OAuth configuration and testing!
