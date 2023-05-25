const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minLength: 4,
    validate: {
      validator: function (v) {
        return !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(v);
      },
      message: (props) => `Special characters in username not allowed`,
    },
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^[^@]+@[^@]+\.[^@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email`,
    },
  },
  name: String,
  passwordHash: String,
  playlists: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Playlist",
    },
  ],
});

userSchema.plugin(uniqueValidator);

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
