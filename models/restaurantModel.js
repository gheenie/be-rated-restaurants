const db = require("../db/connection");

function fetchRestaurants() {
  return db.query("SELECT * FROM restaurants;").then((response) => {
    return response.rows;
  });
}

function addRestaurant(newRestaurant) {
  const { restaurant_name, area_id, cuisine, website } = newRestaurant;

  return db.query(
    `INSERT INTO restaurants (restaurant_name, area_id, cuisine, website) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;`,
    [restaurant_name, area_id, cuisine, website]
  )
  .then(results => results.rows[0]);
}

function removeRestaurant(restaurantId) {
  return db.query(
    `DELETE FROM restaurants
    WHERE restaurant_id = $1
    RETURNING *;`,
    [restaurantId]
  );
}

module.exports = { fetchRestaurants, addRestaurant, removeRestaurant };
