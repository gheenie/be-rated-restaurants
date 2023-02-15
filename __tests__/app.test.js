const request = require("supertest");
const app = require("../app.js");
const connection = require("../db/connection");
const seedData = require("../db/data/index");
const { seed } = require("../db/seed");

beforeAll(() => seed(seedData));

afterAll(() => connection.end());

describe("GET: /api", () => {
  it("200; should return the valid message", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then((response) => {
        expect(response.body.message).toBe("all ok");
      });
  });
});

describe("GET: /api/restaurants", () => {
  it("200; correct highest level property and it's value's data type", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        const body = response.body;

        expect(body).toHaveProperty("restaurants");
        expect(body.restaurants).toBeInstanceOf(Array);
      });
  });

  it("200; restaurants have the correct shape", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;
        
        expect(restaurants).toHaveLength(8);

        restaurants.forEach((restaurant) => {
          expect(restaurant).toMatchObject({
            restaurant_name: expect.any(String),
            area_id: expect.any(Number),
            cuisine: expect.any(String),
            website: expect.any(String),
            average_rating: expect.any(Number),
          });
        });
      });
  });

  it("200; average rating of each restaurant is correct", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;

        // restaurant_id === 1
        expect(restaurants[5].average_rating).toBe(3);
        // restaurant_id === 4
        expect(restaurants[1].average_rating).toBe(4);
      });
  });
});

describe("POST: /api/restaurants", () => {
  it("201; response has the newly created restaurant", () => {
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

describe("DELETE: /api/restaurants/:restaurant_id", () => {
  it("204", () => {
    const restaurant_id = 1;

    return request(app)
      .delete("/api/restaurants/" + restaurant_id)
      .expect(204);
  });

  it("204; restaurant removed from the db is correct", () => {
    const restaurant_id = 2;

    return request(app)
      .delete("/api/restaurants/" + restaurant_id)
      .expect(204)
      .then(() => {
        return connection.query("SELECT * FROM restaurants WHERE restaurant_id = 2;");
      })
      .then((result) => {
        expect(result.rows).toHaveLength(0);
      });
  });
});

describe("PATCH: /api/restaurants/:restaurant_id", () => {
  it("200", () => {
    const updateObject = { area_id: 3 };
    const restaurantId = 3;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(200);
  });

  it("200; returned restaurant has the correctly updated key", () => {
    const updateObject = { area_id: 2 };
    const restaurantId = 3;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(200)
      .then((response) => {
        const updatedRestaurant = response.body.restaurant;

        expect(updatedRestaurant.area_id).toBe(2);
      });
  });

  it("200; invalid key not added to returned restaurant", () => {
    const updateObject = {
      area_id: 2,
      restaurant_name: "Burger King",
      menu: "Burger",
    };
    const restaurantId = 4;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(200)
      .then((response) => {
        const updatedRestaurant = response.body.restaurant;

        expect(updatedRestaurant.area_id).toBe(2);
        expect(updatedRestaurant.restaurant_name).toBe("Burger King");
        expect(updatedRestaurant).not.toHaveProperty("menu");
      });
  });

  it("400; no keys provided", () => {
    const updateObject = {};
    const restaurantId = 4;

    return request(app)
      .patch(`/api/restaurants/${restaurantId}`)
      .send(updateObject)
      .expect(400);
  });
});

describe("GET: /api/areas/:area_id/restaurants", () => {
  it("200; correct highest level value's data type", () => {
    const areaId = 1;
    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((response) => {
        const area = response.body.area;

        expect(typeof area).toBe("object");
      });
  });

  it("200; correct area returned", () => {
    const areaId = 1;

    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((response) => {
        const area = response.body.area;

        expect(area.area_name).toBe("Northern Quarter");
      });
  });

  it("200; correct restaurants returned", () => {
    const areaId = 1;
    
    return request(app)
      .get(`/api/areas/${areaId}/restaurants`)
      .expect(200)
      .then((response) => {
        const restaurants = response.body.area.restaurants;

        expect(response.body.area.total_restaurants).toBe(2);
        expect(restaurants).toHaveLength(2);
        expect(restaurants[0]).toMatchObject({
          restaurant_name: "Pieminister",
          restaurant_id: 5,
          cuisine: "Pies And More Pies",
          website: "",
          area_id: areaId,
        });
        expect(restaurants[1]).toMatchObject({
          restaurant_name: "Dehli 2 go",
          restaurant_id: 7,
          cuisine: "Late night food",
          website: "http://delhi2go-online.co.uk/",
          area_id: areaId,
        });
      });
  });
});

describe("GET: /api/restaurants?search", () => {
  it("200; only 1 match", () => {
    return request(app)
      .get("/api/restaurants?search=Pieminister")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;

        expect(restaurants).toHaveLength(1);
        expect(restaurants[0]).toMatchObject({
          restaurant_name: "Pieminister",
          area_id: 1,
          cuisine: "Pies And More Pies",
          website: "",
          average_rating: 1,
        });
      });
  });

  it("200; >1 matches", () => {
    return request(app)
      .get("/api/restaurants?search=Pi")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;

        expect(restaurants).toHaveLength(2);
        expect(restaurants[0]).toMatchObject({
          restaurant_name: "Rudys Pizza",
          area_id: 2,
          cuisine: "Neapolitan Pizzeria",
          website: "http://rudyspizza.co.uk/",
          average_rating: 5,
        });
        expect(restaurants[1]).toMatchObject({
          restaurant_name: "Pieminister",
          area_id: 1,
          cuisine: "Pies And More Pies",
          website: "",
          average_rating: 1,
        });
      });
  });
});

describe("GET: /api/restaurants?sort_by", () => {
  it("200; restaurants sorted by restaurant_name DESC by default", () => {
    return request(app)
      .get("/api/restaurants")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;

        expect(restaurants[0].restaurant_id).toBe(8);
        expect(restaurants[1].restaurant_id).toBe(3);
        expect(restaurants[2].restaurant_id).toBe(5);
        expect(restaurants[5].restaurant_id).toBe(6);
      });
  });

  it("200; restaurants sorted by the correct param, DESC", () => {
    return request(app)
      .get("/api/restaurants?sort_by=average_rating")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;

        expect(restaurants[0].restaurant_id).toBe(7);
        expect(restaurants[1].restaurant_id).toBe(3);
        expect(restaurants[2].restaurant_id).toBe(4);
        expect(restaurants[5].restaurant_id).toBe(5);
      });
  });
});

describe("GET: /api/restaurants?sort_by&search", () => {
  it("200; multiple params correctly applied", () => {
    return request(app)
      .get("/api/restaurants?sort_by=average_rating&search=u")
      .expect(200)
      .then((response) => {
        const restaurants = response.body.restaurants;

        expect(restaurants[0].restaurant_id).toBe(3);
        expect(restaurants[1].restaurant_id).toBe(4);
        expect(restaurants[2].restaurant_id).toBe(6);
        expect(restaurants[3].restaurant_id).toBe(8);
      });
  });
});