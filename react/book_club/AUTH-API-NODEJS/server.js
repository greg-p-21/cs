// login from https://www.cluemediator.com/create-rest-api-for-authentication-in-node-js-using-jwt

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');
const db = require('./db');

const app = express();
const port = process.env.PORT || 4000;

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.headers['authorization'];
    if (!token) return next(); //if no token, continue
   
    token = token.replace('Bearer ', '');
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
        if (err) {
            return res.status(401).json({
            error: true,
            message: "Invalid user."
            });
        } else {
            req.user = user; //set the user to req so other routes can use it
            next();
        }
    });
});
   
// request handlers
app.get('/', (req, res) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Invalid user to access it.' });
    res.send('Welcome to the Node.js Tutorial! - ' + req.user.name);
});


// validate the user credentials
app.post('/users/signin', async function (req, res, next) {
    const user = req.body.username;
    const pwd = req.body.password;


    
    // return 400 status if username/password does not exist
    if (!user || !pwd) {
        return res.status(400).json({
            error: true,
            message: "Username or Password is required."
        });
    }
    try {
        let userData = await db.getUserData(user);
        if (userData.password === pwd) {
            // generate token
            const token = utils.generateToken(userData);
            // get basic user details
            const userObj = utils.getCleanUser(userData);
            // return the token along with user details
            return res.json({ user: userObj, token });
        }

        if (pwd !== userData.password) {
            return res.status(401).json({
                error: true,
                message: "Username or Password is wrong."
            });
        }
    } catch (err) {
        console.error(`Error while getting password `, err.message);
        next(err);
    }
});

// create new user
app.post('/users/signup', async function (req, res, next) {
    const name = req.body.name;
    const user = req.body.username;
    const pwd = req.body.password;
    const cpwd = req.body.cpwd;

    // return 400 status if username/password does not exist
    if (!user || !pwd || !name || !cpwd) {
        return res.status(400).json({
            error: true,
            message: "All fields are required."
        });
    }

    if (pwd !== cpwd) {
        return res.status(400).json({
            error: true,
            message: "Passwords must match."
        });
    }

    try {
        let message = await db.createUser(name, user, pwd);

        let userData = await db.getUserData(user);

        // generate token
        const token = utils.generateToken(userData);
        // get basic user details
        const userObj = utils.getCleanUser(userData);
        // return the token along with user details
        return res.json({ user: userObj, token });
    } catch (err) {
        console.error(`Error while creating user `, err.message);
        next(err);
    }
});

// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
    // vheck header or url parameters or post parameters for token
    var token = req.query.token;
    if (!token) {
        return res.status(400).json({
            error: true,
            message: "Token is required"
        });
    }

    // check token that was passed by decoding token using secret
    jwt.verify(token, process.env.JWT_SECRET, function (err, user) {
        if (err) return res.status(401).json({
            error: true,
            message: "Invalid token."
        });

        // return 401 status if the userId does not match.
        if (user.userId !== userData.userId) {
            return res.status(401).json({
                error: true,
                message: "Invalid user."
            });
        }

        // get basic user details
        var userObj = utils.getCleanUser(userData);
        return res.json({ user: userObj, token});
    });
});

// add books
app.post('/books/add', async function (req, res, next) {
    const title = req.body.title;
    const author = req.body.author;
    const description = req.body.description;

    // return 400 status if usertitle/password does not exist
    if (!author || !title || !description) {
        return res.status(400).json({
            error: true,
            message: "All fields are required."
        });
    }

    try {
        let message = await db.addBook(title, author, description);

        return res.json({ message: message});
    } catch (err) {
        console.error(`Error while adding book `, err.message);
        next(err);
    }
});

// add content
app.post('/chat/send', async function (req, res, next) {
    console.log("send");
    const content = req.body.content;
    const authorName = req.body.authorName;
    const idBooks = req.body.idBooks;

    // return 400 status if usertitle/password does not exist
    if (!content || !authorName || !idBooks) {
        return res.status(400).json({
            error: true,
            message: "All fields are required."
        });
    }
    console.log("in api call");
    try {
        let message = await db.addChat(content, authorName, idBooks);

        return res.json({ message: message});
    } catch (err) {
        console.error(`Error while adding content `, err.message);
        next(err);
    }
});

// get content
app.post('/chat/get', async function (req, res, next) {
    console.log("send");
    const idBooks = req.body.idBooks;

    // return 400 status if usertitle/password does not exist
    if (!idBooks) {
        return res.status(400).json({
            error: true,
            message: "All fields are required."
        });
    }
    console.log("in get content call");
    try {
        let chat = await db.getChat(idBooks);
        return res.json(chat);
    } catch (err) {
        console.error(`Error while getting chat `, err.message);
        next(err);
    }
});

// get books
app.get('/books', async function (req, res, next) {
    try {
        let books = await db.getBooks();
        // console.log(json(books));
        return res.json(books);
    } catch (err) {
        console.error(`Error while getting books `, err.message);
        next(err);
    }
});





app.listen(port, () => {
    console.log('Server started on: ' + port);
});