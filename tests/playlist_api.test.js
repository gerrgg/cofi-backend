const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Playlist = require("../models/playlist");
const User = require("../models/user");
const helper = require("./test_helper");

beforeEach(async () => {
  await Playlist.deleteMany();
  await User.deleteMany();

  const playlistObjects = helper.initialPlaylists.map(
    (playlist) => new Playlist(playlist)
  );

  const promiseArray = playlistObjects.map((playlist) => playlist.save());
  await Promise.all(promiseArray);

  await helper.createUsers();
});

describe("when viewing a specific playlist", () => {
  test("A playlist can be viewed", async () => {
    const playlistsAtStart = await helper.getAllPlaylists();

    await api
      .get(`/api/playlists/${playlistsAtStart[0].id}`)
      .expect(200)
      .expect("Content-Type", /application\/json/);
  });
});

describe("when creating playlists", () => {
  test("creation succeeds when properly authorized", async () => {
    const playlistsAtStart = await helper.getAllPlaylists();

    const newPlaylist = {
      name: "Greg's run list",
    };

    const token = await helper.getValidToken();

    await api
      .post("/api/playlists")
      .send(newPlaylist)
      .expect(201)
      .set("Authorization", "Bearer " + token)
      .expect("Content-Type", /application\/json/);

    const playlistsAtEnd = await helper.getAllPlaylists();
    expect(playlistsAtEnd).toHaveLength(playlistsAtStart.length + 1);

    const playlistnames = playlistsAtEnd.map((p) => p.name);
    expect(playlistnames).toContain(newPlaylist.name);
  });

  test("creation fails without proper authorization", async () => {
    const newPlaylist = {
      name: "Greg's run list",
    };

    const token = await helper.getValidToken();

    await api
      .post("/api/playlists")
      .send(newPlaylist)
      .expect(400)
      .set("Authorization", "Bearer 1" + token)
      .expect("Content-Type", /application\/json/);
  });
});

describe("when updating playlists", () => {
  test("Playlist can be updated", async () => {
    const token = await helper.getValidToken();

    const newPlaylist = await helper.createPlaylist(
      { name: "Awesome Playlist" },
      token
    );

    expect(newPlaylist.videos).toHaveLength(0);

    const update = {
      name: "Even Better Playlist",
    };

    const response = await api
      .put(`/api/playlists/${newPlaylist.id}`)
      .send(update)
      .expect(200)
      .set("Authorization", "Bearer " + token)
      .expect("Content-Type", /application\/json/);

    expect(response.body.name).toBe(update.name);
  });

  test("videos can only be edit by the owner", async () => {
    const token = await helper.getValidToken();

    const newPlaylist = await helper.createPlaylist(
      { name: "Awesome Playlist" },
      token
    );

    const unauthorizedToken = await helper.getValidToken(
      helper.initialUsers[1]
    );

    const update = {
      name: "haha i hacked you lol",
    };

    await api
      .put(`/api/playlists/${newPlaylist.id}`)
      .send(update)
      .expect(401)
      .set("Authorization", "Bearer " + unauthorizedToken);
  });
});

describe("when deleting a playlist", () => {
  test("A playlist can be deleted by its owner", async () => {
    const token = await helper.getValidToken();

    const newPlaylist = await helper.createPlaylist(
      { name: "Awesome Playlist" },
      token
    );

    const playlistsAtStart = await helper.getAllPlaylists();

    await api
      .delete(`/api/playlists/${newPlaylist.id}`)
      .set("Authorization", "Bearer " + token)
      .expect(204);

    const playlistAtEnd = await helper.getAllPlaylists();

    expect(playlistAtEnd).toHaveLength(playlistsAtStart.length - 1);
  });

  test("A playlist cannot be deleted other users", async () => {
    const token = await helper.getValidToken(helper.initialUsers[0]);

    const newPlaylist = await helper.createPlaylist(
      { name: "Awesome Playlist" },
      token
    );

    const unauthorizedToken = await helper.getValidToken(
      helper.initialUsers[1]
    );

    await api
      .delete(`/api/playlists/${newPlaylist.id}`)
      .set("Authorization", "Bearer " + unauthorizedToken)
      .expect(401);
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
