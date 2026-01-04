const mongooose = require("mongoose");

const userSchema = mongooose.Schema(
  {
    username: {
      type: String,
      require: [true, "Please fill name of the user"],
    },
    email: {
      type: String,
      require: [true, "Please fill email of the user"],
      unique: [true, "Email address already exists"],
    },
    password: {
      type: String,
      require: [true, "Please enter an password"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongooose.model("User", userSchema);
