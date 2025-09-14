require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const connectPgSimple =  require("connect-pg-simple");
const pg = require("pg");
const uploadRoutes = require('./routes/upload');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3001;

const PgSession = connectPgSimple(session);

const pgPool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL, // store in .env
  ssl: {
    rejectUnauthorized: false, // needed for Supabase
  },
  max: 10, // max number of clients in the pool 
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add connection error handling
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

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
    secure: false, // Set to true in production with HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
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
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  // In a real app, you would save the user to a database
  const user = {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
    photo: profile.photos[0].value
  };
  
  pgPool.query(
    `INSERT INTO public.users (id, name, email, photo) 
         VALUES ($1, $2, $3, $4) 
     ON CONFLICT (id) 
     DO UPDATE 
     SET name = EXCLUDED.name, 
         email = EXCLUDED.email, 
         photo = EXCLUDED.photo 
         RETURNING *`,
    [user.id, user.name, user.email, user.photo]
  ).then(res => {
    console.log("User upserted:", res.rows[0]);
  }).catch(err => {
    console.error("Error upserting user:", err);
  });
  
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
  passport.authenticate('google', { scope: [
    'profile', 
    'email',
    'https://www.googleapis.com/auth/youtube.upload'
  ] })
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

app.get("/test", async (req, res) => {
  try {
    const result = await pgPool.query("SELECT * FROM session");
    res.json({ 
      success: true, 
      sessionCount: result.rows[0].count,
      sessionID: req.sessionID 
    });
  } catch (err) {
    console.error("Session table error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.use('/api', uploadRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});