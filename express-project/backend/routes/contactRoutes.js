const express = require("express");
const router = express.Router();
const {
  getContacts,
  createContact,
  getContact,
  updateContact,
  deleteContact,
} = require("../controllers/contactControllers");

router.route("/").get(getContacts).post(createContact);

router.route("/:id").get(getContact).put(updateContact).delete((req, res) => {
  console.log(`Deleting contact with ID: ${req.params.id}`);
  deleteContact(req, res);
});

module.exports = router;
