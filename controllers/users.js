const bcrypt = require("bcrypt");
const usersRouter = require("express").Router();
const User = require("../models/user");

// get all
usersRouter.get("/", async (request, response) => {
  const users = await User.find({}).populate("playlists", {
    name: 1,
    videos: 1,
    date: 1,
  });
  response.json(users);
});

usersRouter.get("/:id", async (request, response, next) => {
  const user = await User.findById(request.params.id).populate("playlists", {
    name: 1,
    videos: 1,
    date: 1,
  });
  response.json(user);
});

usersRouter.post("/", async (request, response) => {
  const { username, name, password } = request.body;

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash,
  });

  try {
    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    response.status(404).end();
  }
});

// delete
usersRouter.delete("/:id", async (request, response, next) => {
  await User.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = usersRouter;
