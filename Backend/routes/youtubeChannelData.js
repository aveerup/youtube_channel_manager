const router = require('express').Router();
const { pgPool } = require('../db/supabase.js');
const { getChannelData } = require('../helperFunctions/getChannelData.js');

router.get('/channel/data', async (req, res) => {
  try {
    // Get user tokens from database
    const userResult = await pgPool.query(
      `SELECT access_token, refresh_token, expire_date 
       FROM users 
       WHERE id = $1`,
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }

    const user = userResult.rows[0];
    const channelData = await getChannelData(user.access_token, user.refresh_token, user.expire_date);

    res.json(channelData);

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;