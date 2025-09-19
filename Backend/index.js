require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const path = require('path');
const fs = require('fs');
const { pgPool } = require('./db/supabase');
const connectPgSimple = require("connect-pg-simple");

const uploadRoutes = require('./routes/cloudinaryUpload');
const youtubeUploadRoutes = require('./routes/youtubeUploadRoute');
const youtubeChannelDataRoutes = require('./routes/youtubeChannelData');
const youtubeChannelAnalyticsRoutes = require('./routes/youtubeChannelAnalytics');
const generateTitleRoute = require('./routes/generateTitleRoute');
const generateDescriptionRoute = require('./routes/generateDescriptionRoute');
const generateTagRoute = require('./routes/generateTagRoute');
const cancelRoute = require('./routes/cancelRoute');

const app = express();
const PORT = process.env.PORT || 3001;

app.set('trust proxy', 1); // trust first proxy

const PgSession = connectPgSimple(session);

const uploadDir = path.join(__dirname, './uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}
    
// CORS configuration to allow credentials
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());

// Session configuration
app.use(session({
  store: new PgSession({
    pool: pgPool,              // use Supabase Postgres
    tableName: "session",      // default is "session"
    schemaName: "public",   // default is "public" 
  }),
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'none' // Set to 'none' for cross-site cookies
  }
}));

app.use((req, res, next) => {
  console.log(req.sessionID); 
  next();
});

app.use((req, res, next) => {
  console.log('Session data:', req.session);
  next();
});

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log('Session data:', req.session);
  next();
});

// Passport Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/auth/google/callback'
}, async (accessToken, refreshToken, params, profile, done) => {
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    photo: profile.photos[0].value,
    access_token: accessToken,
    refresh_token: refreshToken,
    expire_date: new Date(Date.now() + (params.expires_in * 1000)) // Convert seconds to milliseconds
  };
  console.log('expires_in:', params.expires_in);
  
  await pgPool.query(
    `INSERT INTO public.users (id, name, email, photo, access_token, refresh_token, expire_date) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     ON CONFLICT (id) 
     DO UPDATE 
     SET name = EXCLUDED.name, 
         email = EXCLUDED.email, 
         photo = EXCLUDED.photo,
         access_token = EXCLUDED.access_token,
         refresh_token = EXCLUDED.refresh_token,
         expire_date = EXCLUDED.expire_date 
     RETURNING *`,
    [user.id, user.name, user.email, user.photo, user.access_token, user.refresh_token, user.expire_date]
  );
  
  return done(null, user);
}));

// Serialize and deserialize user for session
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Not authenticated' });
};

// Routes
app.get('/', (req, res) => {
  res.send('Hello from Express server with Google OAuth!');
});

// Auth routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
      'https://www.googleapis.com/auth/youtube.readonly'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
  }
);

// API routes
app.get('/api/user', isAuthenticated, (req, res) => {
  res.json(req.user);
});

app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error destroying session' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logged out successfully' });
    });
  });
});

app.use('/api', youtubeUploadRoutes);
app.use('/api', uploadRoutes);
app.use('/api', cancelRoute);
app.use('/api', youtubeChannelDataRoutes);
app.use('/api', youtubeChannelAnalyticsRoutes);
app.use('/api', generateTitleRoute);
app.use('/api', generateDescriptionRoute);
app.use('/api', generateTagRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});