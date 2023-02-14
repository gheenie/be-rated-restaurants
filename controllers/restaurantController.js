const { fetchRestaurants } = require("../models/restaurantModel");

function getRestaurants(request, response) {
  fetchRestaurants().then((restaurants) => {
    response.status(200).send({ restaurants });
  });
}

module.exports = { getRestaurants };
