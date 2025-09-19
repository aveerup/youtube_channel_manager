const router = require('express').Router();
const { pgPool } = require('../db/supabase.js');
const { getChannelAnalytics } = require('../helperFunctions/getChannelAnalytics.js');

router.post('/channel/analytics', async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    let month_range = parseInt(req.body.month_range);
    if (!month_range) 
        month_range = 24;

    console.log("Month Range:", month_range);

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
    const channelAnalytics = await getChannelAnalytics(month_range, user.access_token, user.refresh_token, user.expire_date);

    res.json(channelAnalytics);

  } catch (error) {
    console.error('Route error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;