const Video = require("../models/video");
const User = require("../models/user");
const Playlist = require("../models/playlist");

const bcrypt = require("bcrypt");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);

const initialVideos = [
  {
    key: "jfKfPfyJRdk",
  },
  {
    key: "BrnDlRmW5hs",
  },
];

const initialUsers = [
  {
    username: "jsally123",
    email: "jimno@aol.com",
    name: "Jim Sally",
    password: "password",
  },
  {
    username: "usertwo",
    email: "abcasd@aol.com",
    name: "Sally jim",
    password: "password",
  },
];

const initialPlaylists = [
  {
    name: "My Awesome Playlist",
  },
];

const createUsers = async () => {
  for (let user of initialUsers) {
    const passwordHash = await bcrypt.hash("password", 10);

    let userObject = new User({
      ...user,
      passwordHash,
    });

    await userObject.save();
  }
};

const nonExistingId = async () => {
  const video = new Video({ key: "jfKfPfyJRd1" });
  await video.save();
  await video.deleteOne();

  return video._id.toString();
};

const getAllVideos = async () => {
  const videos = await Video.find({});
  return videos.map((video) => video.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const getAllPlaylists = async () => {
  const playlists = await Playlist.find({});
  return playlists.map((video) => video.toJSON());
};

const getValidToken = async (user = false) => {
  const userToLogin = user ? user : initialUsers[0];

  const username = userToLogin.username;
  const password = userToLogin.password;

  const response = await api.post("/api/login").send({ username, password });

  return response.body.token;
};

const createPlaylist = async (playlist, token) => {
  const response = await api
    .post("/api/playlists")
    .send(playlist)
    .expect(201)
    .set("Authorization", "Bearer " + token)
    .expect("Content-Type", /application\/json/);
  return response.body;
};

module.exports = {
  initialVideos,
  initialUsers,
  initialPlaylists,
  nonExistingId,
  getAllVideos,
  getAllPlaylists,
  usersInDb,
  getValidToken,
  createUsers,
  createPlaylist,
};
