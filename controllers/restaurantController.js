const { fetchRestaurants, addRestaurant } = require("../models/restaurantModel");

function getRestaurants(request, response) {
  fetchRestaurants().then((restaurants) => {
    response.status(200).send({ restaurants });
  });
}

function createRestaurant(request, response) {
  const newRestaurant = request.body;
  
  addRestaurant(newRestaurant)
  .then(restaurant => {
    response.status(201).send({ restaurant });
  });
}

module.exports = { getRestaurants, createRestaurant };
