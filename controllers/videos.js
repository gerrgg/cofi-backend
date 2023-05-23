const videosRouter = require("express").Router();
const axios = require("axios");
const Video = require("../models/video");
const User = require("../models/user");

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

  try {
    const result = await axios.get(
      `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${body.key}&format=json`
    );

    const data = await result.data;

    const user = await User.findById(body.userId);

    const video = new Video({
      key: body.key,
      title: data.title,
      thumbnail: data.thumbnail_url,
      user: user.id,
    });

    const savedVideo = await video.save();
    response.json(savedVideo);
  } catch (error) {
    console.error(error);
  }
});

// delete
videosRouter.delete("/:id", async (request, response, next) => {
  await Video.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

// videosRouter.put("/:id", (request, response, next) => {
//   const body = request.body;

//   const video = new Video({
//     key: body.key,
//   });

//   Video.findByIdAndUpdate(request.params.id, video, { new: true })
//     .then((updatedVideo) => {
//       response.json(updatedVideo);
//     })
//     .catch((error) => next(error));
// });

module.exports = videosRouter;
