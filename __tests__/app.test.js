const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection");
const seedData = require("../db/data/index");
const { seed } = require("../db/seed");

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
      restaurant_name: "McDonald's",
      area_id: 2,
      cuisine: "American",
      website: "www.mcdonalds.com",
    };

    return request(app)
      .post("/api/restaurants")
      .send(newRestaurant)
      .expect(201)
      .then((response) => {
        expect(response.body.restaurant).toEqual({
          restaurant_id: 9,
          ...newRestaurant,
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
        return connection.query(
          "SELECT * FROM restaurants WHERE restaurant_id = 2;"
        );
      })
      .then((result) => {
        expect(result.rows).toHaveLength(0);
      });
  });
});

describe("PATCH: 200 - /api/restaurants/:restaurant_id", () => {
  it("should return a 200 code", () => {
    const updateObject = { area_id: 2 };
    const restaurantId = 4;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(200);
  });
  it("should update the key value", () => {
    const updateObject = { area_id: 2 };
    const restaurantId = 3;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(200)
      .then((result) => {
        const updatedRestaurant = result.body.restaurant;
        expect(updatedRestaurant.area_id).toBe(2);
      });
  });
  it("should ignore any other keys", () => {
    const updateObject = { area_id: 2, restaurant_name: "Burger King" };
    const restaurantId = 3;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(200)
      .then((result) => {
        const updatedRestaurant = result.body.restaurant;
        expect(updatedRestaurant.area_id).toBe(2);
        expect(updatedRestaurant.restaurant_name).toBe("Rudys Pizza");
      });
  });
  it("should return 400 if no keys provided", () => {
    const updateObject = {};
    const restaurantId = 3;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(400);
  });
});

describe("GET: 200 - /api/areas/:area_id/restaurants", () => {
  it("should return an object with a key of area with an object as value", () => {
    const areaId = 1;
    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((result) => {
        const obj = result.body.area;
        expect(typeof obj).toBe("object");
      });
  });

  it("should return the correct restaurant count", () => {
    const areaId = 1;
    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((result) => {
        const obj = result.body.area;
        expect(obj.restaurants).toHaveLength(2);
      });
  });
  it("should return the area name", () => {
    const areaId = 1;
    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((result) => {
        const obj = result.body.area;
        expect(obj.area_name).toBe("Northern Quarter");
      });
  });
  it("should return an array of the area restaurants", () => {
    const areaId = 1;
    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((result) => {
        const restaurants = result.body.area.restaurants;
        expect(restaurants[0]).toMatchObject({
          restaurant_name: "Pieminister",
          restaurant_id: 5,
          cuisine: "Pies And More Pies",
          website: "",
          area_id: 1,
        });
        expect(restaurants[1]).toMatchObject({
          restaurant_name: "Dehli 2 go",
          restaurant_id: 7,
          cuisine: "Late night food",
          website: "http://delhi2go-online.co.uk/",
          area_id: 1,
        });
      });
  });
});
