const {
  addRestaurant,
  removeRestaurant,
  patchRestaurant,
  fetchAreaByAreaId,
  fetchRestaurantsByAreaId,
  fetchRestaurantsWithQueries,
} = require("../models/restaurantModel");

function getRestaurants(request, response, next) {
  let { search } = request.query;
  let { sort_by } = request.query;

  if (search === undefined) search = '';
  if (sort_by === undefined) sort_by = 'restaurant_name';

  fetchRestaurantsWithQueries(search, sort_by)
    .then((restaurants) => {
      response.status(200).send({ restaurants });
    })
    .catch((err) => {
      next(err);
    });
}

function createRestaurant(request, response, next) {
  const newRestaurant = request.body;

  addRestaurant(newRestaurant)
    .then((restaurant) => {
      response.status(201).send({ restaurant });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteRestaurant(request, response, next) {
  const { restaurantId } = request.params;

  removeRestaurant(restaurantId)
    .then((result) => {
      response.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
}

function updateRestaurant(request, response, next) {
  const { restaurantId } = request.params;
  const keys = ["area_id", "restaurant_name", "cuisine", "website"];
  const updateObj = {};
  keys.forEach((key) => {
    if (request.body.hasOwnProperty(key)) {
      updateObj[key] = request.body[key];
    }
  });

  if (Object.keys(updateObj).length === 0) {
    response.status(400).send();
    return;
  }

  patchRestaurant(restaurantId, updateObj)
    .then((restaurant) => {
      response.status(200).send({ restaurant });
    })
    .catch((err) => {
      next(err);
    });
}

function getRestaurantsByAreaId(request, response, next) {
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
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  getRestaurants,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
  getRestaurantsByAreaId,
};
