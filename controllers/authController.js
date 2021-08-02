const UserModel = require("../models/UserModel");
const apiResponse = require("../helpers/apiResponse");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
/**
 * User registration.
 *
 * @param {string}      name
 * @param {string}      phoneNumber
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */

exports.register = async (req, res) => {
   try {
      console.log('req =--------------', req.body)
      const { name, email, password, number } = req.body;
      // Extract the validation errors from a request.
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         // Display sanitized values/errors messages.
         return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
         let existUser = await getUser({ email });
         if (existUser) return apiResponse.ErrorResponse(res, "User already exist.");
         //hash input password
         bcrypt.hash(password, 10, function (err, hash) {
            console.log('has pass --\n', hash)
            // Create User object with escaped and trimmed data
            var user = new UserModel(
               { name, email, password: hash, number }
            );

            // Save user.
            user.save(function (err) {
               if (err) { return apiResponse.ErrorResponse(res, err); }
               let userData = {
                  _id: user._id,
                  name: user.name,
                  number: user.number,
                  email: user.email
               };
               return apiResponse.successResponseWithData(res, "User registered successfully.", userData);

            })
         });
      }
   } catch (err) {
      throw err //in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
   }
};

/**
 * User login.
 *
 * @param {string}      email
 * @param {string}      password
 *
 * @returns {Object}
 */
exports.login = async (req, res) => {
   try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
         return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
      } else {
         const user = await getUser({ email: req.body.email })
         if (user) {
            //Compare given password with db's hash.
            bcrypt.compare(req.body.password, user.password, function (err, same) {
               if (same) {
                  //Check account confirmation.


                  let userData = {
                     _id: user._id,
                     name: user.name,
                     email: user.email,
                     address: user.number,
                  };
                  //Prepare JWT token for authentication
                  const jwtPayload = userData;
                  const jwtData = {
                     expiresIn: process.env.JWT_TIMEOUT_DURATION,
                  };
                  const secret = process.env.JWT_SECRET;
                  //Generated JWT token with Payload and secret.
                  userData.token = jwt.sign(jwtPayload, secret, jwtData);
                  res.cookie("token", userData.token, { maxAge: 604800000 });
                  return apiResponse.successResponseWithData(res, "Login Success.", userData);


               } else {
                  return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
               }
            });
         } else {
            return apiResponse.unauthorizedResponse(res, "Email or Password wrong.");
         }

      }
   } catch (err) {
      return apiResponse.ErrorResponse(res, err);
   }
};


exports.usersList = async (req, res) => {
   try {
      UserModel.find((err, result) => {
         if (err) {
            return apiResponse.ErrorResponse(res, err);
         } else {
            return apiResponse.successResponseWithData(res, "Success.", result);
         }
      });
   } catch (err) {
      throw err //in json response with status 500.
      return apiResponse.ErrorResponse(res, err);
   }
};

const getUser = (query) => {
   // console.log('query ------------', query)
   return new Promise((resolve, reject) => {
      UserModel.findOne(query, (err, result) => {
         if (err) {
            reject(err);
         } else {
            resolve(result);
         }
      });
   });
}

