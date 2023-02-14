const request = require("supertest");
const app = require("../app.js");

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
