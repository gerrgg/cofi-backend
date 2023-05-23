const playlistsRouter = require("express").Router();
const Playlist = require("../models/playlist");
const User = require("../models/user");
const Video = require("../models/video");

// get all
playlistsRouter.get("/", async (request, response) => {
  const playlists = await Playlist.find({}).populate("user", {
    username: 1,
  });
  response.json(playlists);
});

// get single
playlistsRouter.get("/:id", async (request, response, next) => {
  const playlist = await Playlist.findById(request.params.id).populate("user", {
    username: 1,
  });
  response.json(playlist);
});

// create
playlistsRouter.post("/", async (request, response, next) => {
  const body = request.body;

  const user = await User.findById(body.userId);

  const playlist = new Playlist({
    name: body.name === undefined ? "New Playlist" : body.name,
    user: user.id,
  });

  const savedPlaylist = await playlist.save();
  user.playlists = user.playlists.concat(savedPlaylist._id);
  await user.save();

  response.json(savedPlaylist);
});

// delete
playlistsRouter.delete("/:id", async (request, response, next) => {
  await Playlist.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = playlistsRouter;
