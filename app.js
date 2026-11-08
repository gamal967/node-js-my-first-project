require('dotenv').config({ quiet: true });

// Fail fast with a clear message when a required variable is missing
// (instead of crashing later inside Stripe / the session store).
const REQUIRED_ENV = ['MONGODB_URI', 'STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY', 'SESSION_SECRET', 'APP_URL'];
const missingEnv = REQUIRED_ENV.filter(key => !process.env[key]);
if (missingEnv.length > 0) {
    console.error('Missing required environment variables: ' + missingEnv.join(', '));
    console.error('Set them in your hosting dashboard (Hostless -> Environment) or in a local .env file.');
    process.exit(1);
}

const rootDir = require('./util/path');
const path = require('path');
const fs = require('fs');
const os = require('os');

const express = require('express');
const bodyParser = require('body-parser');
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin');
const shopRoute = require('./routes/shop');
const authRoutes = require('./routes/auth');
const User = require('./models/user');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const MONGODB_URI = process.env.MONGODB_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const app = express();

// Hostless, Render and similar hosts sit behind a reverse proxy.
app.set('trust proxy', 1);

// excute mongodb store constructor
// The callback is required: without it the library throws an unhandled
// rejection when the database is unreachable, hiding the real error.
const store = new MongoDBStore({
    uri: MONGODB_URI,
    collection: 'sessions'
}, err => {
    if (err) {
        console.error('Session store connection failed:', err);
        process.exit(1);
    }
});
store.on('error', err => console.error('Session store error:', err));

// Uploads are stored outside the repo when UPLOAD_DIR is set
// (use it with a writable volume, e.g. /var/data/images).
let uploadDir = process.env.UPLOAD_DIR || path.join(rootDir, 'images');
try {
    fs.mkdirSync(uploadDir, { recursive: true });
    // Hostless runs apps with a read-only filesystem. The directory may
    // already exist in the image, so check that it is really writable.
    fs.accessSync(uploadDir, fs.constants.W_OK);
} catch (err) {
    // Fall back to the writable temp directory so the app still starts and
    // uploads still work; files stored there do not survive a restart.
    console.warn('Upload directory "' + uploadDir + '" is not writable (' + err.code + '); using the temp directory instead. Uploads will not persist.');
    uploadDir = path.join(os.tmpdir(), 'uploads');
    fs.mkdirSync(uploadDir, { recursive: true });
}


const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, new Date().toISOString() + '-' + safeName);
    }
});

const fileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
    ) {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.set('view engine', 'pug');
app.set('views', path.join(rootDir, 'views'));


//Middlewares

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            // Stripe Checkout needs its script, iframe and API.
            'script-src': ["'self'", 'https://js.stripe.com'],
            'frame-src': ["'self'", 'https://js.stripe.com', 'https://hooks.stripe.com'],
            'connect-src': ["'self'", 'https://api.stripe.com'],
            'img-src': ["'self'", 'data:', 'https://*.stripe.com']
        }
    }
}));
app.use(compression());
// Log requests to stdout (Morgan's default stream). Never write an
// access log file: hosted platforms such as Hostless run the app on a
// read-only filesystem.
app.use(morgan('combined'));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));

app.use(express.static(path.join(rootDir, 'public')));
app.use('/images', express.static(uploadDir));

app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store: store,
        cookie: {
            httpOnly: true,
            sameSite: 'lax',
            secure: IS_PRODUCTION
        }
    }));

app.use(csrf());

app.use(flash());


//Tokens
app.use((req, res, next) => {
    res.locals.isAu = req.session.isloggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
})




// //AI{
// app.use((req, res, next) => {
//     res.locals.flashMessage = req.session.flashMessage;
//     delete req.session.flashMessage;
//     next();
// });
// //}

app.use((req, res, next) => {
    // throw new Error('Error out');
    if (!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id)
        .then(user => {
            // throw new Error('Error');
            if (!user) {
                return next();
            }

            req.user = user;
            next();

        })
        .catch(err => {
            // throw new Error(err);
            next(new Error(err)); //the next error is used with async code & thorws error is used with sync
        });
});




//Routes
app.use('/admin', adminRoutes);
app.use(shopRoute);
app.use(authRoutes);
app.use('/500', errorController.get500);
app.use(errorController.get404);


app.use((error, req, res, next) => {
    console.error(error);
    if (res.headersSent) {
        return next(error);
    }
    const statusCode = error.httpStatusCode || error.status || error.statusCode || 500;
    const view = statusCode === 404 ? '404' : '500';
    res.status(statusCode).render(view
        , {
            docTitle: 'error ' + statusCode
            , path: '/' + statusCode
            , islogedIn: req.session && req.session.islogedIn
        });
})


mongoose
    .connect(MONGODB_URI)
    .then(() => {
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, '0.0.0.0', () => {
            console.log('Connected! Server listening on port ' + PORT);
        });
    })
    .catch(err => {
        console.error('MongoDB connection failed:', err);
        // Exit so the host (Render) reports a failed deploy instead of
        // leaving a process alive that never listens on PORT.
        process.exit(1);
    });
