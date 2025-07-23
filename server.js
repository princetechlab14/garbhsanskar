require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const http = require('http');
const compression = require('compression');
const bodyParser = require('body-parser');
const cors = require("cors");

const indexRouter = require('./routes/index');
const adminRouter = require('./routes/admin');
const apiRouter = require('./routes/api');

const app = express();
app.use(compression());
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3048',
  'http://localhost:3078',
  'https://garbhsanskar.web-gamer.com',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Known-Header'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Database start
const db = require("./models");
const synchronizeAndSeed = async () => {
  try {
    await db.sequelize.sync({ force: true });
    // await db.sequelize.sync();
    await require("./seeder/admin-seeder").admin();
    await require("./seeder/language-seeder").language();
    await require("./seeder/create-work-cat-seeder").WorkCategory();
    await require("./seeder/creative-work-seeder").creativeWorkData();
    await require("./seeder/avoid-food-seeder").AvoidFood();
    await require("./seeder/diet-seeder").Diet();
    await require("./seeder/exercises-seeder").exercises();
    await require("./seeder/music-categories-seeder").MusicCategory();
    await require("./seeder/music-seeder").Music();
    await require("./seeder/pregnancy-seeder").pregnancy();
    await require("./seeder/pregnancy-details-seeder").pregnancyDetail();
    await require("./seeder/pregnancy-week-details-seeder").pregnancyWeekDetail();
    await require("./seeder/article-seeder").ArticleSeed();
    await require("./seeder/vedic-geet-seeder").vedicGeet();
    await require("./seeder/women-details-seeder").womenDetail();
  } catch (error) {
    console.error("Error during synchronization and seeding:", error);
  }
};
// synchronizeAndSeed();
// Database end


app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 5000;
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});