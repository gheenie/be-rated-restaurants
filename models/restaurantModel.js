const db = require("../db/connection");

function fetchRestaurants() {
  return db.query("SELECT * FROM restaurants;").then((response) => {
    return response.rows;
  });
}

module.exports = { fetchRestaurants };
