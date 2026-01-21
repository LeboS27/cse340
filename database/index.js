const { Pool } = require("pg")
require("dotenv").config()

// For Render's PostgreSQL, SSL is required in production
if (process.env.NODE_ENV === "production") {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })
  module.exports = pool
} else {
  // Development (local) configuration
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  })


  module.exports = {
    async query(text, params) {
      try {
        const res = await pool.query(text, params)
        console.log("executed query", { text })
        return res
      } catch (error) {
        console.error("error in query", { text })
        throw error
      }
    },
  }
}