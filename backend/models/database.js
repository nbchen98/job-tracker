const { Pool, types } = require('pg');
require('dotenv').config();

// Return DATE columns as plain 'YYYY-MM-DD' strings. By default pg builds a JS
// Date at the server's local midnight, which shifts the day when serialized.
const DATE_OID = 1082;
types.setTypeParser(DATE_OID, (value) => value);

// Hosted databases require SSL; a local Postgres usually doesn't support it.
const LOCAL_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

const isLocalDatabase = (connectionString) => {
  try {
    return LOCAL_HOSTS.includes(new URL(connectionString).hostname);
  } catch {
    return false; // Unparseable URLs keep the safer default of using SSL
  }
};

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDatabase(process.env.DATABASE_URL) ? false : { rejectUnauthorized: false }
});

module.exports = pool;
