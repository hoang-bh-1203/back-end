const express = require("express");
const Photo = require("../db/photoModel");
const router = express.Router();

router.get("/photosOfUser/:id", function (request, response) {
  var id = request.params.id;

  /**
   * Finding a single user from user's ID
   */
  Photo.find({ user_id: id }, (err, photos) => {
    if (err) {
      console.log(`** Photos for user with id ${id}: Not Found! *`);
      response
        .status(400)
        .send(JSON.stringify(`** Photos for user with id ${id}: Not Found **`));
    } else {
      console.log(`** Read server path /photosOfUser/${id} Success! **`);
      let count = 0; // count the number of processed photos
      const photoList = JSON.parse(JSON.stringify(photos)); // get data from server and convert to JS data

      // For each photo in photos list:
      photoList.forEach((photo) => {
        delete photo.__v; // remove the unnessary property before sending to client.

        // For each comment in comments list:
        /**
         * ! To fecth multiple modules, need to use async.each().
         */
        async.eachOf(
          photo.comments,
          (comment, index, callback) => {
            // Use comment's user_id to get user object and update comment's user property.
            User.findOne({ _id: comment.user_id }, (error, user) => {
              if (!error) {
                const userObj = JSON.parse(JSON.stringify(user)); // parse retrieved Mongoose user data
                const { location, description, occupation, __v, ...rest } =
                  userObj; // only keep (_id, first_name, last_name) properties
                photo.comments[index].user = rest; // update the user obj to each comment's user property.
                delete photo.comments[index].user_id; // remove unnessary property for each comment
              }
              callback(error);
            });
          },
          (error) => {
            count += 1;
            if (error) {
              response
                .status(400)
                .send(
                  JSON.stringify(
                    `** Photos for user with id ${id}: Not Found **`,
                  ),
                );
            } else if (count === photoList.length) {
              // Response to client only after aysnc.each() has processed all Photos in photoList.
              console.log("Done all  async() processing");
              response.json(photoList); // Response to client, finanly!
            }
          },
        ); // end of "async.eachOf(photo.comments,)"
      }); // end of "photoList.forEach(photo)"
    }
  });
});

router.get("/", async (request, response) => {});

module.exports = router;
