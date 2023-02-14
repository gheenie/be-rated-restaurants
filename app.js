const express = require("express");
const { getRestaurants, createRestaurant } = require("./controllers/restaurantController");

const app = express();

app.use(express.json());

app.get("/api", (request, response) => {
  response.status(200).send({ message: "all ok" });
});

app.get("/api/restaurants", getRestaurants);

app.post("/api/restaurants", createRestaurant);

module.exports = app;
