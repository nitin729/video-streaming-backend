import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    console.log(user, "user");
    const accessToken = user.genearateAccessToken();
    const refreshToken = user.genearateRefreshToken();

    user.refreshToken = refreshToken;
    //updating user in db
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong when generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //Get user details from UI
  // Validate the request -- not empty
  // check if user is already registered -- username and email
  //check for images and avatar
  //upload them to cloudinary, and check if it is uploaded on cloudinary
  // create user object - create entry in db
  // remove password and refresh token field from response
  //check for user creation
  //return response

  const { fullName, email, userName, password } = req.body;

  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }
  // write email validation

  const avatarLocalPath = req.files?.avatar[0]?.path;
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, " Avatar is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, " Avatar is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    userName: userName.toLowerCase(),
    password,
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Internal server error");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User has been registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  //get data from req body
  //validate the data in req body -- not empty
  //check if the user is present in db
  // password check
  //generate access and refresh token
  //send secure cookie
  //send response

  const { email, password, userName } = req.body;

  if (!password && !email) {
    throw new ApiError(400, "email or password is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  let cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(200, {
        user: loggedInUser,
        refreshToken,
        accessToken,
      })
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError();
  }
  await User.findByIdAndUpdate(
    user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  let cookieOptions = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User Logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  //access refresh token from cookies or if sent in body
  //check if token exists
  //verify the token with jwt and get the decoded token
  //get the user by id stored in decoded token
  //check if the user exist
  // check if the incoming token and saved token matches
  //if matched, generate new tokens and send the response with cookies
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized access, Refresh token not found");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(400, "User not found");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }
    const { newAccessToken, newRefreshToken } =
      await generateAccessAndRefreshToken(user._id);
    let cookieOptions = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          },
          "Access Token refreshed successfully"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Refresh token was expired or not found");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
