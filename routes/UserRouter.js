const express = require("express");
const User = require("../db/userModel");
const router = express.Router();

router.get("/user/list", function (request, response) {
  User.find({}, function (err, users) {
    // Error handling
    if (err) {
      console.log("** Get user list: Error! **");
      response.status(500).send(JSON.stringify(err));
    } else {
      /**
       * "user" returned from Mongoose is Array type: Array of user objects.
       * also need to be processed as Mongoose models and models from frontend do not allign perpectly.
       */
      console.log("** Read server path /user/list Success! **");
      const userList = JSON.parse(JSON.stringify(users)); // convert Mongoose data to Javascript obj

      /**
       * * async method with "async.each()"
       */
      // const newUserList = [];
      // async.each(userList, (user, doneCallback) => {
      //     const { first_name, last_name, _id } = user;
      //     newUserList.push({ first_name, last_name, _id });
      //     doneCallback(err);
      //     console.log("From async: ", newUserList);
      // }, error => {
      //     if (error) {
      //         console.log(error);
      //     } else {
      //         response.json(newUserList);
      //     }
      // });

      /**
       * * non-async method
       * Get only wanted user proeprties from Database's model,
       * and construct a new users obj to response.
       */
      const newUsers = userList.map((user) => {
        const { first_name, last_name, _id } = user;
        return { first_name, last_name, _id };
      });

      // Send response to client
      response.json(newUsers);
    }
  });
});

router.get("/user/:id", function (request, response) {
  const id = request.params.id;

  /**
   * Finding a single user from user's ID
   */
  User.findOne({ _id: id }, function (err, user) {
    if (err) {
      console.log(`** User ${id}: Not Found! **`);
      response.status(400).send(JSON.stringify(err));
    } else {
      console.log(`** Read server path /user/${id} Success! **`);
      const userObj = JSON.parse(JSON.stringify(user)); // convert mongoose data to JS data
      delete userObj.__v; // remove unnecessary property
      response.json(userObj);
    }
  });
});

module.exports = router;
