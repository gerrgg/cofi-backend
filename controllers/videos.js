const videosRouter = require("express").Router();
const Video = require("../models/video");

// get all
videosRouter.get("/", (request, response) => {
  Video.find({}).then((videos) => {
    response.json(videos);
  });
});

// get single
videosRouter.get("/:id", (request, response, next) => {
  Video.findById(request.params.id)
    .then((video) => {
      if (video) {
        response.json(video);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// create
videosRouter.post("/", async (request, response, next) => {
  const body = request.body;

  try {
    const result = await fetch(
      `https://www.youtube.com/oembed?url=http://www.youtube.com/watch?v=${body.key}&format=json`
    );
    const data = await result.json();

    const video = new Video({
      key: body.key,
      title: data.title,
      thumbnail: data.thumbnail_url,
    });

    video
      .save()
      .then((savedVideo) => {
        response.json(savedVideo);
      })
      .catch((error) => next(error));
  } catch (error) {
    console.error(error);
  }
});

// delete
videosRouter.delete("/:id", (request, response, next) => {
  Video.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end();
    })
    .catch((error) => next(error));
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
