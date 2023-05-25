const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Video = require("../models/video");
const helper = require("./test_helper");

beforeEach(async () => {
  await Video.deleteMany();

  const videoObjects = helper.initialVideos.map((video) => new Video(video));

  const promiseArray = videoObjects.map((video) => video.save());
  await Promise.all(promiseArray);
});

describe("when there are videos in db", () => {
  test("videos are returned as json", async () => {
    await api
      .get("/api/videos")
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });

  test("returns videos in json", async () => {
    const videos = await helper.getAllVideos();
    expect(videos).toHaveLength(helper.initialVideos.length);
  });
  test("the first video has a key set", async () => {
    const videos = await helper.getAllVideos();
    const keys = videos.map((r) => r.key);
    expect(keys).toContain("jfKfPfyJRdk");
  });
});

describe("viewing adding videos", () => {
  test("A video can be added", async () => {
    const newVideo = {
      key: "k3WkJq478To",
    };

    await api
      .post("/api/videos")
      .send(newVideo)
      .expect(201)
      .expect("Content-type", /application\/json/);

    const videos = await helper.getAllVideos();

    const keys = videos.map((r) => r.key);

    expect(videos).toHaveLength(helper.initialVideos.length + 1);
    expect(keys).toContain(newVideo.key);
  });

  test("An invalid video id will not be added to the DB", async () => {
    const newVideo = {
      title: "title",
    };

    await api
      .post("/api/videos")
      .send(newVideo)
      .expect(400)
      .expect("Content-type", /application\/json/);

    const videos = await helper.getAllVideos();

    expect(videos).toHaveLength(helper.initialVideos.length);
  });
});

describe("viewing a specific video", () => {
  test("A specific video can be is returned as json with status 200", async () => {
    const videosAtStart = await helper.getAllVideos();

    const response = await api
      .get(`/api/videos/${videosAtStart[0].id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);

    expect(response.body.key).toEqual(videosAtStart[0].key);
  });

  test("viewing a video that does not exist returns 400", async () => {
    await api
      .get(`/api/videos/${helper.nonExistingId()}`)
      .expect(400)
      .expect("Content-Type", /application\/json/);
  });
});

describe("when deleting a video", () => {
  test("deleting an existing video returns 204", async () => {
    const videosAtStart = await helper.getAllVideos();

    await api.delete(`/api/videos/${videosAtStart[0].id}`).expect(204);

    const videosAtEnd = await helper.getAllVideos();

    expect(videosAtEnd).toHaveLength(videosAtStart.length - 1);
  });

  test("deleting a non-existant video return 400", async () => {
    await api.delete(`/api/videos/${helper.nonExistingId()}`).expect(400);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
