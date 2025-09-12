#!/usr/bin/env node

/**
 * Generate a secure JWT secret for production use
 * Run this script with: node generate-secret.js
 */

const crypto = require('crypto');

function generateSecureSecret() {
  // Generate a 64-byte (512-bit) random string
  const secret = crypto.randomBytes(64).toString('hex');
  return secret;
}

const secret = generateSecureSecret();

console.log('🔐 Generated JWT Secret:');
console.log('='.repeat(50));
console.log(secret);
console.log('='.repeat(50));
console.log('');
console.log('📝 Add this to your .env file:');
console.log(`JWT_SECRET=${secret}`);
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('- Keep this secret secure and never commit it to version control');
console.log('- Use different secrets for development and production');
console.log('- Store production secrets in your hosting platform\'s environment variables');
