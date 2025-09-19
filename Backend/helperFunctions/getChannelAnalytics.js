const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const { pgPool } = require('../db/supabase');

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.BACKEND_URL}/auth/google/callback`
);

const youtube = google.youtube('v3');
const youtubeAnalytics = google.youtubeAnalytics('v2');

async function getChannelAnalytics(month_range, accessToken, refreshToken, expire_date) {
    try {
        oauth2Client.setCredentials({
            access_token: accessToken,
            refresh_token: refreshToken,
            expiry_date: new Date(expire_date).getTime()
        });

        const { token } = await oauth2Client.getAccessToken(); // new access token

        await pgPool.query(
            `UPDATE users 
            SET access_token = $1, expire_date = $2 
            WHERE refresh_token = $3
            RETURNING *`,
            [oauth2Client.credentials.access_token, new Date(oauth2Client.credentials.expiry_date), refreshToken]
        )

        const channelResponse = await youtube.channels.list({
            auth: oauth2Client,
            part: ['snippet, contentDetails, statistics'],
            mine: true
        });

        if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
            throw new Error('No channel found');
        }
    
        const channel = channelResponse.data.items[0];
        
        let current_date = new Date();
    
        const month_gap = month_range / 4;
        
        let one_month_gap_ago = new Date(current_date);
        one_month_gap_ago.setMonth(one_month_gap_ago.getMonth() - month_gap);
        one_month_gap_ago = one_month_gap_ago.toISOString().split('T')[0];

        let two_month_gap_ago = new Date(current_date);
        two_month_gap_ago.setMonth(two_month_gap_ago.getMonth() - 2*month_gap);
        two_month_gap_ago = two_month_gap_ago.toISOString().split('T')[0];

        let three_month_gap_ago = new Date(current_date);
        three_month_gap_ago.setMonth(three_month_gap_ago.getMonth() - 3*month_gap);
        three_month_gap_ago = three_month_gap_ago.toISOString().split('T')[0];

        let four_month_gap_ago = new Date(current_date);
        four_month_gap_ago.setMonth(four_month_gap_ago.getMonth() - 4*month_gap);
        four_month_gap_ago = four_month_gap_ago.toISOString().split('T')[0];

        current_date = current_date.toISOString().split('T')[0];

        // Get channel analytics if available
        const analyticsResponse1 = await youtubeAnalytics.reports.query({
            auth: oauth2Client,
            ids: `channel==${channel.id}`,
            startDate: one_month_gap_ago,
            endDate: current_date,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained',
        }).catch(err => {
        console.log('Analytics not available:', err.message);
        return null;
        });

        const analyticsResponse2 = await youtubeAnalytics.reports.query({
            auth: oauth2Client,
            ids: `channel==${channel.id}`,
            startDate: two_month_gap_ago,
            endDate: one_month_gap_ago,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained',
        }).catch(err => {
        console.log('Analytics not available:', err.message);
        return null;
        });

        const analyticsResponse3 = await youtubeAnalytics.reports.query({
            auth: oauth2Client,
            ids: `channel==${channel.id}`,
            startDate: three_month_gap_ago,
            endDate: two_month_gap_ago,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained',
        }).catch(err => {
        console.log('Analytics not available:', err.message);
        return null;
        });

        const analyticsResponse4 = await youtubeAnalytics.reports.query({
            auth: oauth2Client,
            ids: `channel==${channel.id}`,
            startDate: four_month_gap_ago,
            endDate: three_month_gap_ago,
            metrics: 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained',
        }).catch(err => {
        console.log('Analytics not available:', err.message);
        return null;
        });

        let analyticsResponse = null;
        if (analyticsResponse1 && analyticsResponse2 && analyticsResponse3) {
        analyticsResponse = {
            labels: [three_month_gap_ago, two_month_gap_ago, one_month_gap_ago, current_date],
            views : [
                analyticsResponse4.data.rows ? analyticsResponse1.data.rows[0][0] : 0,
                analyticsResponse3.data.rows ? analyticsResponse2.data.rows[0][0] : 0,
                analyticsResponse2.data.rows ? analyticsResponse3.data.rows[0][0] : 0,
                analyticsResponse1.data.rows ? analyticsResponse4.data.rows[0][0] : 0,
            ],
            estimatedMinutesWatched : [
                analyticsResponse4.data.rows ? analyticsResponse1.data.rows[0][1] : 0,
                analyticsResponse3.data.rows ? analyticsResponse2.data.rows[0][1] : 0,
                analyticsResponse2.data.rows ? analyticsResponse3.data.rows[0][1] : 0,
                analyticsResponse1.data.rows ? analyticsResponse4.data.rows[0][1] : 0,
            ],
            averageViewDuration : [
                analyticsResponse4.data.rows ? analyticsResponse1.data.rows[0][2] : 0,
                analyticsResponse3.data.rows ? analyticsResponse2.data.rows[0][2] : 0,
                analyticsResponse2.data.rows ? analyticsResponse3.data.rows[0][2] : 0,
                analyticsResponse1.data.rows ? analyticsResponse4.data.rows[0][2] : 0,
            ],
            subscribersGained : [
                analyticsResponse4.data.rows ? analyticsResponse1.data.rows[0][3] : 0,
                analyticsResponse3.data.rows ? analyticsResponse2.data.rows[0][3] : 0,
                analyticsResponse2.data.rows ? analyticsResponse3.data.rows[0][3] : 0,
                analyticsResponse1.data.rows ? analyticsResponse4.data.rows[0][3] : 0,
            ],
        };
        }
        
        console.log('Channel Analytics:', analyticsResponse);
       
        return {
            analytics: analyticsResponse
        };

    } catch (error) {
        console.error('Error fetching channel analytics:', error);
        throw error;
    }
}

module.exports = { getChannelAnalytics };
