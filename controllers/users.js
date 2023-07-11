const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// get all
usersRouter.get("/", async (request, response) => {
  const users = await User.find({});
  response.json(users);
});

usersRouter.get("/:id", async (request, response, next) => {
  const user = await User.findById(request.params.id);
  response.json(user);
});

usersRouter.get("/:id", async (request, response, next) => {
  const user = await User.findById(request.params.id);
  response.json(user);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password, email } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
    email,
  });

  const savedUser = await user.save();
  response.status(201).json(savedUser);
});

usersRouter.put("/", async (request, response, next) => {
  const { username, name, password, email } = request.body;

  const user = await User.findById(request.user.id);

  if (user) {
    if (password) {
      user.passwordHash = await bcrypt.hash(password, 10);
    }

    if (username) {
      user.username = username;
    }

    if (email) {
      user.email = email;
    }

    if (name) {
      user.name = name;
    }

    console.log(user);

    await user.save();

    response.status(201).json(user);
  } else {
    response.status(401).end();
  }
});

// delete
usersRouter.delete("/:id", async (request, response, next) => {
  await User.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = usersRouter;
