'use strict';

const express = require('express');
const router = express.Router();
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const auth = require('../middleware/auth');
const validation = require('../middleware/validation');
const ownership = require('../middleware/ownership');
const { success, error } = require('../utils/response');

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.STORAGE_CLOTHINGITEMS_NAME || process.env.DYNAMODB_TABLE_NAME || 'clothingitems';

// GET /items — list all items (public)
router.get('/', async (req, res) => {
  try {
    const { ownerId } = req.query;
    let params = { TableName: TABLE_NAME };
    if (ownerId) {
      params.FilterExpression = 'ownerId = :ownerId';
      params.ExpressionAttributeValues = { ':ownerId': ownerId };
    }
    const result = await dynamoDb.scan(params).promise();
    return success(res, result.Items);
  } catch (err) {
    console.error('GET /items error:', err);
    return error(res, 'Internal server error', 500);
  }
});

// GET /items/:id — get single item (public)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await dynamoDb.get({ TableName: TABLE_NAME, Key: { id } }).promise();
    if (!result.Item) return error(res, 'Listing not found', 404);
    return success(res, result.Item);
  } catch (err) {
    console.error('GET /items/:id error:', err);
    return error(res, 'Internal server error', 500);
  }
});

// POST /items — create item (authenticated, validated)
router.post('/', auth, validation, async (req, res) => {
  try {
    const { title, description, price, category, condition, imageKeys } = req.body;
    const ownerId = req.userId;
    const now = new Date().toISOString();
    const item = {
      id: uuidv4(),
      title, description, price, category, condition, imageKeys, ownerId,
      createdAt: now, updatedAt: now,
    };
    await dynamoDb.put({ TableName: TABLE_NAME, Item: item }).promise();
    return success(res, item, 201);
  } catch (err) {
    console.error('POST /items error:', err);
    return error(res, 'Internal server error', 500);
  }
});

// PUT /items/:id — update item (authenticated, validated, owner only)
router.put('/:id', auth, validation, ownership, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, condition, imageKeys } = req.body;
    const now = new Date().toISOString();
    const params = {
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: 'SET title = :title, description = :description, price = :price, category = :category, #cond = :condition, imageKeys = :imageKeys, updatedAt = :updatedAt',
      ExpressionAttributeNames: { '#cond': 'condition' },
      ExpressionAttributeValues: {
        ':title': title, ':description': description, ':price': price,
        ':category': category, ':condition': condition, ':imageKeys': imageKeys, ':updatedAt': now,
      },
      ReturnValues: 'ALL_NEW',
    };
    const result = await dynamoDb.update(params).promise();
    return success(res, result.Attributes);
  } catch (err) {
    console.error('PUT /items/:id error:', err);
    return error(res, 'Internal server error', 500);
  }
});

// DELETE /items/:id — delete item (authenticated, owner only)
router.delete('/:id', auth, ownership, async (req, res) => {
  try {
    const { id } = req.params;
    await dynamoDb.delete({ TableName: TABLE_NAME, Key: { id } }).promise();
    return success(res, { message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('DELETE /items/:id error:', err);
    return error(res, 'Internal server error', 500);
  }
});

module.exports = router;
