const express = require('express');

// Express Config
const web = express();
const PORT = process.env.PORT || 3000;

web.get('/', (req, res) => {
    res.send('Hello World!');
});

web.get('/auth', (req, res) => {
    res.send('OAuth2 Flow Completed');
});

web.listen(PORT, () => {
    console.log(`Express running on port ${PORT}`);
});