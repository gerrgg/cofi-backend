const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  name: String,
  videos: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  date: { type: Date, default: Date.now },
});

playlistSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

const Playlist = mongoose.model("Playlist", playlistSchema);

module.exports = Playlist;
