const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const User = require("../models/user");
const helper = require("./test_helper");

beforeEach(async () => {
  await User.deleteMany();

  const userObjects = helper.initialUsers.map((user) => new User(user));

  const promiseArray = userObjects.map((user) => user.save());
  await Promise.all(promiseArray);
});

describe("when there are already users in the db", () => {
  test("creation succeeds with a fresh username", async () => {
    const usersAtStart = await helper.usersInDb();

    const newUser = {
      username: "root123",
      email: "jimbo89@gmail.com",
      name: "Greg Bastianelli",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(201)
      .expect("Content-Type", /application\/json/);

    const usersAtEnd = await helper.usersInDb();
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    expect(usernames).toContain(newUser.username);
  });

  test("creation fails with duplicate username", async () => {
    const newUser = {
      username: "jsally123",
      email: "foxhunter9991@gmail.com",
      name: "Greg Bastianelli",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("creation fails with username using special characters", async () => {
    const newUser = {
      username: ";DROP_TABLE",
      email: "foxxypoxxy999@yahoo.com",
      name: "Greg Bastianelli",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });

  test("creation fails with obviously fake email", async () => {
    const newUser = {
      username: "realusername4",
      email: "12.com",
      name: "Greg Bastianelli",
      password: "password",
    };

    await api
      .post("/api/users")
      .send(newUser)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });
});

describe("when viewing a specific user", () => {
  test("A user will include playlist information", async () => {
    const usersAtStart = await helper.usersInDb();

    const response = await api
      .get(`/api/users/${usersAtStart[0].id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.playlists).toEqual(usersAtStart[0].playlists);
  });
});

describe("when deleting a user", () => {
  test("A video can be deleted", async () => {
    const usersAtStart = await helper.usersInDb();

    await api.delete(`/api/users/${usersAtStart[0].id}`).expect(204);

    const usersAtEnd = await helper.usersInDb();

    expect(usersAtEnd).toHaveLength(usersAtStart.length - 1);
  });

  test("deleting a non-existant user return 400", async () => {
    await api.delete(`/api/users/${helper.nonExistingId()}`).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
