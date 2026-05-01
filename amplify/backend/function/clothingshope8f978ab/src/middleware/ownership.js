'use strict';

const AWS = require('aws-sdk');
const { error } = require('../utils/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.STORAGE_CLOTHINGITEMS_NAME || process.env.DYNAMODB_TABLE_NAME || 'clothingitems';

async function ownership(req, res, next) {
  try {
    const { id } = req.params;
    const result = await dynamoDb.get({ TableName: TABLE_NAME, Key: { id } }).promise();
    if (!result.Item) return error(res, 'Listing not found', 404);
    if (result.Item.ownerId !== req.userId) return error(res, 'You do not have permission to modify this listing', 403);
    req.item = result.Item;
    next();
  } catch (err) {
    console.error('Ownership check error:', err);
    return error(res, 'Internal server error', 500);
  }
}

module.exports = ownership;
