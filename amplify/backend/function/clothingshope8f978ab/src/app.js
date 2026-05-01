
/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_CLOTHINGIMAGES_BUCKETNAME
	STORAGE_CLOTHINGITEMS_ARN
	STORAGE_CLOTHINGITEMS_NAME
	STORAGE_CLOTHINGITEMS_STREAMARN
Amplify Params - DO NOT EDIT */'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const itemsRouter = require('./routes/items');

const app = express();

app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  next();
});

// Mount routes
app.use('/items', itemsRouter);

// Error-handling middleware
app.use(function (err, req, res, next) {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(3000, function () {
  console.log('App started');
});

module.exports = app;
