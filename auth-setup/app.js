const express = require('express');
const session = require('express-session');
const { Issuer, generators } = require('openid-client');
const path = require('path');

const app = express();
let client;

// 1. Initialize OpenID Client
async function initializeClient() {
    const issuer = await Issuer.discover('https://cognito-idp.eu-central-1.amazonaws.com/eu-central-1_d9JNeVdni');
    client = new issuer.Client({
        client_id: '6a6ivhcg1i8ludo95q2fm84u90',
        client_secret: '1h9hblo8lul800t18ispq5qeffh8rbgc4frri8liif9vjad5p85a', // <-- REPLACE with your actual secret
        redirect_uris: ['https://decodedmusic.com/dashboard'],
        response_types: ['code']
    });
}
initializeClient().catch(console.error);

// 2. Session Middleware
app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: false
}));

// 3. Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 4. Auth Check Middleware
const checkAuth = (req, res, next) => {
    req.isAuthenticated = !!req.session.userInfo;
    next();
};

// 5. Home Route
app.get('/', checkAuth, (req, res) => {
    res.render('home', {
        isAuthenticated: req.isAuthenticated,
        userInfo: req.session.userInfo
    });
});

// 6. Login Route
app.get('/login', (req, res) => {
    const nonce = generators.nonce();
    const state = generators.state();
    req.session.nonce = nonce;
    req.session.state = state;
    const authUrl = client.authorizationUrl({
        scope: 'email openid phone',
        state,
        nonce,
    });
    res.redirect(authUrl);
});

// 7. Callback Route
app.get('/dashboard', async (req, res) => {
    try {
        const params = client.callbackParams(req);
        const tokenSet = await client.callback(
            'https://decodedmusic.com/dashboard',
            params,
            {
                nonce: req.session.nonce,
                state: req.session.state
            }
        );
        const userInfo = await client.userinfo(tokenSet.access_token);
        req.session.userInfo = userInfo;
        res.redirect('/');
    } catch (err) {
        console.error('Callback error:', err);
        res.redirect('/');
    }
});

// 8. Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy();
    const logoutUrl = `https://eu-central-1d9jnevdni.auth.eu-central-1.amazoncognito.com/logout?client_id=6a6ivhcg1i8ludo95q2fm84u90&logout_uri=https://decodedmusic.com/`;
    res.redirect(logoutUrl);
});

// 9. Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
