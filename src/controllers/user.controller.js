import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";

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
  console.log(email);
  if (
    [fullName, email, userName, password].some((field) => field.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = User.findOne({
    $or: [{ userName }, { email }],
  });
  console.log(existingUser, "existing user");
  if (existingUser) {
    throw ApiError(409, "User with this email or username already exists");
  }
  // write email validation

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  console.log(req.files, "req files");
  if (avatarLocalPath) {
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
    throw ApiError(500, "Internal server error");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User has been registered successfully")
    );
});

export { registerUser };
