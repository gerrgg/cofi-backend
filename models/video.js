const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    minlength: 11,
    maxLength: 11,
  },
  title: String,
  thumbnail: String,
  date: { type: Date, default: Date.now },
});

videoSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model("Note", videoSchema);
