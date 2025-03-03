const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = '';

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.
app.get('/', async (req, res) => {
    const movieUrl = 'https://api.hubspot.com/crm/v3/objects/2-139909312?properties=length,name,synopsis,genre,year';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    let allMovies = [];
    let after = null;

    const stripArticles = (title) => {
        return title.replace(/^(a |an |the )/i, '').trim();
    };

    try {
        do {
            const url = after ? `${movieUrl}&after=${after}` : movieUrl;
            const resp = await axios.get(url, { headers });
            const data = resp.data.results;
            allMovies = allMovies.concat(data);
            after = resp.data.paging ? resp.data.paging.next.after : null;
        } while (after);

        // Sort movies by name in alphabetical order, ignoring articles
        allMovies.sort((a, b) => {
            const nameA = stripArticles(a.properties.name.toUpperCase());
            const nameB = stripArticles(b.properties.name.toUpperCase());
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });

        res.render('homepage', { title: 'Homepage | Movies', data: allMovies });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching movies');
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.
app.get('/update', (req, res) => {
    res.render('update', { title: 'Update Custom Object Form | Integrating With HubSpot I Practicum' });
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            name: req.body.name,
            year: req.body.year,
            genre: req.body.genre,
            length: req.body.length,
            synopsis: req.body.synopsis
        }
    };

    const movieId = req.query.id;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        // Create new movie
        const createMovieUrl = 'https://api.hubapi.com/crm/v3/objects/2-139909312';
        await axios.post(createMovieUrl, update, { headers });
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating movie');
    }
});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));