const { Pool } = require("pg")
require("dotenv").config()

/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool

// Configuration for both environments
const config = {
  connectionString: process.env.DATABASE_URL
}

// Add SSL configuration based on environment
if (process.env.NODE_ENV === "development") {
  config.ssl = {
    rejectUnauthorized: false,
  }
}

pool = new Pool(config)

// Added for troubleshooting queries during development
if (process.env.NODE_ENV === "development") {
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
} else {
  module.exports = pool
}