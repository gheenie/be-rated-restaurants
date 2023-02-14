const db = require("../db/connection");

function fetchRestaurants() {
  return db.query(
    `SELECT restaurants.*, AVG(rating) as average_rating
    FROM restaurants
    JOIN ratings
    USING (restaurant_id)
    GROUP BY restaurant_id;`
  )
  .then((response) => {
    return response.rows.map(restaurant => {
      restaurant.average_rating = Number(restaurant.average_rating);
      
      return restaurant;
    });
  });
}

function addRestaurant(newRestaurant) {
  const { restaurant_name, area_id, cuisine, website } = newRestaurant;

  return db
    .query(
      `INSERT INTO restaurants (restaurant_name, area_id, cuisine, website) 
    VALUES ($1, $2, $3, $4)
    RETURNING *;`,
      [restaurant_name, area_id, cuisine, website]
    )
    .then((results) => results.rows[0]);
}

function removeRestaurant(restaurantId) {
  return db.query(
    `DELETE FROM restaurants
    WHERE restaurant_id = $1
    RETURNING *;`,
    [restaurantId]
  );
}

function patchRestaurant(restaurantId, area_id) {
  return db
    .query(
      `UPDATE restaurants
    SET area_id = $1
    WHERE restaurant_id = $2
    RETURNING *;`,
      [area_id, restaurantId]
    )
    .then((result) => {
      return result.rows[0];
    });
}

function fetchAreaByAreaId(areaId) {
  return db
    .query(`SELECT * FROM areas WHERE area_id = $1;`, [areaId])
    .then((result) => {
      return result.rows[0];
    });
}

function fetchRestaurantsByAreaId(areaId) {
  return db
    .query(`SELECT * FROM restaurants WHERE area_id = $1;`, [areaId])
    .then((result) => {
      return result.rows;
    });
}

module.exports = {
  fetchRestaurants,
  addRestaurant,
  removeRestaurant,
  patchRestaurant,
  fetchAreaByAreaId,
  fetchRestaurantsByAreaId,
};
