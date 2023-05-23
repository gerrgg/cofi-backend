const playlistsRouter = require("express").Router();
const axios = require("axios");
const Playlist = require("../models/playlist");
const User = require("../models/user");

// get all
playlistsRouter.get("/", (request, response) => {
  Playlist.find({}).then((playlists) => {
    response.json(playlists);
  });
});

// get single
playlistsRouter.get("/:id", (request, response, next) => {
  Playlist.findById(request.params.id)
    .then((playlist) => {
      if (playlist) {
        response.json(playlist);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
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
playlistsRouter.delete("/:id", (request, response, next) => {
  Playlist.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// playlistsRouter.put("/:id", (request, response, next) => {
//   const body = request.body;

//   const playlist = new Playlist({
//     key: body.key,
//   });

//   Playlist.findByIdAndUpdate(request.params.id, playlist, { new: true })
//     .then((updatedPlaylist) => {
//       response.json(updatedPlaylist);
//     })
//     .catch((error) => next(error));
// });

module.exports = playlistsRouter;
