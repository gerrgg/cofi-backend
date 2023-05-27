const playlistsRouter = require("express").Router();
const Playlist = require("../models/playlist");

// get all
playlistsRouter.get("/", async (request, response) => {
  const playlists = await Playlist.find({}).populate("user", {
    username: 1,
  });
  response.json(playlists);
});

// get single
playlistsRouter.get("/:id", async (request, response, next) => {
  const userPopulateSettings = {
    username: 1,
  };

  const videoPopulateSettings = { title: 1, key: 1, thumbnail: 1 };

  const playlist = await Playlist.findById(request.params.id)
    .populate("user", userPopulateSettings)
    .populate("videos", videoPopulateSettings);
  response.json(playlist);
});

// create
playlistsRouter.post("/", async (request, response, next) => {
  const body = request.body;

  const playlist = new Playlist({
    name: body.name === undefined ? "New Playlist" : body.name,
    user: request.user.id,
  });

  const savedPlaylist = await playlist.save();
  request.user.playlists = request.user.playlists.concat(savedPlaylist._id);
  await request.user.save();

  response.status(201).json(savedPlaylist);
});

// delete
playlistsRouter.delete("/:id", async (request, response, next) => {
  const playlistToDelete = await Playlist.findById(request.params.id).populate(
    "user"
  );

  if (playlistToDelete.user.id === request.user.id) {
    await playlistToDelete.deleteOne();
    response.status(204).end();
  } else {
    response.status(401).end();
  }
});

playlistsRouter.put("/:id", async (request, response, next) => {
  const body = request.body;

  const playlistToUpdate = await Playlist.findById(request.params.id);

  if (playlistToUpdate.user.toString() === request.user.id) {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      request.params.id,
      body,
      {
        new: true,
      }
    );

    response.status(200).json(updatedPlaylist);
  } else {
    response.status(401).end();
  }
});

module.exports = playlistsRouter;
