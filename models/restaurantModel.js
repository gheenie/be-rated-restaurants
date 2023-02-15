const db = require("../db/connection");
const format = require("pg-format");

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

function patchRestaurant(restaurantId, updateObj) {
  let queryString = "UPDATE restaurants SET";
  for (const [key, value] of Object.entries(updateObj)) {
    queryString += format(` %s = %L,`, key, value);
  }
  queryString =
    queryString.substring(0, queryString.length - 1) +
    format(" WHERE restaurant_id = %L RETURNING *;", restaurantId);
  
  return db.query(queryString).then((result) => {
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

function fetchRestaurantsWithQueries(search, sort_by) {
  const queryStr = format(
    `SELECT restaurants.*, AVG(rating) as average_rating
    FROM restaurants
    JOIN ratings
    USING (restaurant_id)
    WHERE restaurant_name LIKE '%%%s%%'
    GROUP BY restaurant_id
    ORDER BY %s DESC;`,
    search,
    sort_by
  );

  return db.query(queryStr).then((response) => {
    const restaurants = response.rows;

    restaurants.forEach(
      (restaurant) =>
        (restaurant.average_rating = Number(restaurant.average_rating))
    );

    return restaurants;
  });
}

module.exports = {
  addRestaurant,
  removeRestaurant,
  patchRestaurant,
  fetchAreaByAreaId,
  fetchRestaurantsByAreaId,
  fetchRestaurantsWithQueries,
};
