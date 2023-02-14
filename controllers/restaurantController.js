const { fetchRestaurants, addRestaurant, removeRestaurant } = require("../models/restaurantModel");

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

function deleteRestaurant(request, response) {
  const { restaurantId } = request.params;
  
  removeRestaurant(restaurantId)
  .then((result) => {
    //console.log(result.rows);
    response.status(204).send();
  });
}

module.exports = { getRestaurants, createRestaurant, deleteRestaurant };
