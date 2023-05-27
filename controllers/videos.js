const videosRouter = require("express").Router();
const Video = require("../models/video");
const User = require("../models/user");
const Playlist = require("../models/playlist");

// get all
videosRouter.get("/", async (request, response) => {
  const videos = await Video.find({});
  response.json(videos);
});

// get single
videosRouter.get("/:id", async (request, response, next) => {
  const video = await Video.findById(request.params.id);
  response.json(video);
});

// create
videosRouter.post("/", async (request, response, next) => {
  const body = request.body;

  const video = new Video({
    key: body.key,
    title: body.title,
    thumbnail: body.thumbnail,
    playlist: body.playlist,
  });

  const savedVideo = await video.save();

  const playlist = await Playlist.findById(savedVideo.playlist.toString());

  playlist.videos = playlist.videos.concat(savedVideo);

  await playlist.save();

  response.status(201).json(savedVideo);
});

// delete
videosRouter.delete("/:id", async (request, response, next) => {
  await Video.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

module.exports = videosRouter;
