const request = require("supertest");
const app = require("../app.js");
const connection = require('../db/connection');
const seedData = require('../db/data/index');
const { seed } = require('../db/seed');

beforeAll(() => seed(seedData));

afterAll(() => connection.end());

describe("GET: 200 - /api", () => {
  it("should return an object with a status code of 200", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.message).toBe("all ok");
      });
  });
});

describe("GET: 200 - /api/restaurants", () => {
  it("should respond with an object that has a key restaurants", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        expect(response.body).toHaveProperty("restaurants");
      });
  });
  it("should respond with an object that contains an array", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        expect(response.body.restaurants).toBeInstanceOf(Array);
      });
  });
  it("should respond with an object that has an array of restaurant objects", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        response.body.restaurants.forEach((restaurant) => {
          expect(restaurant).toMatchObject({
            restaurant_name: expect.any(String),
            area_id: expect.any(Number),
            cuisine: expect.any(String),
            website: expect.any(String),
          });
        });
      });
  });
});

describe("POST: 201 - /api/restaurants", () => {
  it("should respond with the newly created restaurant object", () => {
    const newRestaurant = {
      "restaurant_name": "McDonald's",
      "area_id": 2,
      "cuisine": "American",
      "website": "www.mcdonalds.com"
    };

    return request(app)
    .post("/api/restaurants")
    .send(newRestaurant)
    .expect(201)
    .then((response) => {
      expect(response.body.restaurant).toEqual({ 
        restaurant_id: 9,
        ...newRestaurant
      });
    });
  });
});

describe("DELETE: 204 - /api/restaurants/:restaurant_id", () => {
  it("should respond with 204", () => {
    const restaurant_id = 1;

    return request(app)
    .delete("/api/restaurants/" + restaurant_id)
    .expect(204);
  });

  it("should remove the correct restaurant from the db", () => {
    const restaurant_id = 2;

    return request(app)
    .delete("/api/restaurants/" + restaurant_id)
    .expect(204)
    .then(() => {
      return connection.query('SELECT * FROM restaurants WHERE restaurant_id = 2;');
    })
    .then(result => {
      expect(result.rows).toHaveLength(0);
    });
  });
});
