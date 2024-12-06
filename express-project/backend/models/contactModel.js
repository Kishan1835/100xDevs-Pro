const mongooose = require("mongoose");

const contactSchema = mongooose.Schema(
  {
    name: {
      type: String,
      required: [true, "please add the contact name "],
    },
    email: {
      type: String,
      required: [true, "please add the email address "],
    },
    phone: {
      type: String,
      required: [true, "please add the Phones number"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongooose.model("contacts", contactSchema);
