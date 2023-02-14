const {
  addRestaurant,
  removeRestaurant,
  patchRestaurant,
  fetchAreaByAreaId,
  fetchRestaurantsByAreaId,
  fetchRestaurantsWithQueries,
} = require("../models/restaurantModel");

function getRestaurants(request, response) {
  const { search } = request.query ?? "";

  fetchRestaurantsWithQueries(search).then((restaurants) => {
    response.status(200).send({ restaurants });
  });
}

function createRestaurant(request, response) {
  const newRestaurant = request.body;

  addRestaurant(newRestaurant).then((restaurant) => {
    response.status(201).send({ restaurant });
  });
}

function deleteRestaurant(request, response) {
  const { restaurantId } = request.params;

  removeRestaurant(restaurantId).then((result) => {
    response.status(204).send();
  });
}

function updateRestaurant(request, response) {
  const { restaurantId } = request.params;
  const { area_id } = request.body;

  if (area_id === undefined) {
    response.status(400).send();
    return;
  }

  patchRestaurant(restaurantId, area_id).then((restaurant) => {
    response.status(200).send({ restaurant });
  });
}

function getRestaurantsByAreaId(request, response) {
  const { areaId } = request.params;
  let returnObject;
  fetchAreaByAreaId(areaId)
    .then((area) => {
      returnObject = { area: { ...area } };
      return fetchRestaurantsByAreaId(areaId);
    })
    .then((restaurants) => {
      returnObject.area.restaurants = restaurants;
      returnObject.area.total_restaurants = restaurants.length;
      response.status(200).send(returnObject);
    });
}

module.exports = {
  getRestaurants,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
  getRestaurantsByAreaId,
};
