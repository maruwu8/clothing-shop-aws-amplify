'use strict';

const { error } = require('../utils/response');

function validation(req, res, next) {
  const errors = [];
  const { title, description, price, category, condition, imageKeys } = req.body || {};

  if (typeof title !== 'string' || title.trim().length === 0) errors.push('title is required');
  if (typeof description !== 'string' || description.trim().length === 0) errors.push('description is required');
  if (typeof price !== 'number' || price <= 0) errors.push('price must be a positive number');
  if (typeof category !== 'string' || category.trim().length === 0) errors.push('category is required');
  if (typeof condition !== 'string' || condition.trim().length === 0) errors.push('condition is required');

  if (!Array.isArray(imageKeys)) {
    errors.push('imageKeys must be an array');
  } else if (imageKeys.length < 1 || imageKeys.length > 5) {
    errors.push('imageKeys must contain 1-5 items');
  } else if (!imageKeys.every((k) => typeof k === 'string' && k.trim().length > 0)) {
    errors.push('each imageKey must be a non-empty string');
  }

  if (errors.length > 0) return error(res, `Validation failed: ${errors.join(', ')}`, 400);
  next();
}

module.exports = validation;
