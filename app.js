const express = require("express");
const { getRestaurants } = require("./controllers/restaurantController");

const app = express();

app.get("/api", (request, response) => {
  response.status(200).send({ message: "all ok" });
});

app.get("/api/restaurants", getRestaurants);

module.exports = app;
