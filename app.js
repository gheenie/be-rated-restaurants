const express = require("express");
const {
  getRestaurants,
  createRestaurant,
  deleteRestaurant,
  updateRestaurant,
  getRestaurantsByAreaId,
} = require("./controllers/restaurantController");
const { handle500Error } = require("./controllers/errorController");

const app = express();

app.use(express.json());

app.get("/api", (request, response) => {
  response.status(200).send({ message: "all ok" });
});

app.get("/api/restaurants", getRestaurants);

app.post("/api/restaurants", createRestaurant);

app.delete("/api/restaurants/:restaurantId", deleteRestaurant);

app.patch("/api/restaurants/:restaurantId", updateRestaurant);

app.get("/api/areas/:areaId/restaurants", getRestaurantsByAreaId);

app.use(handle500Error);

module.exports = app;
