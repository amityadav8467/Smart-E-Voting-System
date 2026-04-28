import mongoose from 'mongoose';

/**
 * Validate that a value is a valid MongoDB ObjectId string
 * @param {*} id
 * @returns {boolean}
 */
export const isValidObjectId = (id) =>
  typeof id === 'string' &&
  /^[0-9a-fA-F]{24}$/.test(id) &&
  mongoose.Types.ObjectId.isValid(id);

/**
 * Sanitize a value to a plain string, rejecting objects to prevent NoSQL injection
 * @param {*} value
 * @returns {string|undefined}
 */
export const sanitizeString = (value) =>
  typeof value === 'string' ? value.trim() : undefined;
