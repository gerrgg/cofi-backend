const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    minlength: 11,
    maxLength: 11,
  },
  playlist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Playlist",
  },

  title: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  date: { type: Date, default: Date.now },
});

videoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Video", videoSchema);
