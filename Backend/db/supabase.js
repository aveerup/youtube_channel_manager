const pg = require("pg");

const pgPool = new pg.Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 20, // increase max connections
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 5000, // how long to wait before timing out when connecting a new client
  maxUses: 7500, // close idle clients after this many uses
  keepAlive: true, // keep connection alive
  keepAliveInitialDelayMillis: 10000 // initial delay before sending keep-alive packets
});

// Add error handler
pgPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

// Add connection error handler
pgPool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('Database client error:', err);
  });
});

module.exports = { pgPool };