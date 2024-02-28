import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    //verify the jwt token with our secret
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    //get the user
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }
    // Add the user object in req
    req.user = user;

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
