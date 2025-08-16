import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { apiResponse } from '../utils/ApiResponse.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

// agar kahi par response khali hai to usko hum "_" se denote kar skte hai.  (e.g req, _)

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new apiError(
      500,
      'Something went wrong while generating referesh and access token'
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // res.status(200).json({
  //   message: 'ok',
  // });

  // get user details from frontend
  // validation (all possible) -not empty
  // check if user exists. : username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object  -- create entry in db
  // remove password and refresh token feild from response
  // check for user creation
  // return res

  // agar form se data aa rha hai to ya direct JSON se data aa rha hai to hamesha "req.body hi likhenege"

  const { fullname, email, username, password } = req.body;
  // console.log("email: " ,email);
  // if (fullname == ""){
  //   throw new apiError(400, "fullname is required")
  // }
  if (
    [fullName, email, username, password].some((field) => field?.trim() === '')
    // some:=> Determines whether the specified callback function returns true for any element of an array.
  ) {
    throw new apiError(400, 'All fields are required');
    // agar false hai to error bhjo
  }
  const existedUser = await User.findOne({
    // yahan db m find kar rhe hai ki agar username aur email kuch bhi hai to thk
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new apiError(409, 'User with email or username already exists');
    // aur agr hai to error bhjo nhi hai to add ho jayega user
  }
  //console.log(req.files);

  const avatarLocalPath = req.files?.avatar[0]?.path;
  // agar req.files main avatar hai to usme se jo first proprety hai uska path nikal k do . is upar kl line ka yhai matlab hai....
  // yahan local path liya hai matlb pehle apne serve par jo store haoga  uske lye

  //const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath; // ye coverImage k lye check kar rhe hai ki coverImage hai ya nahi hai
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    // "Array.isArray" ka matlab hai ki array banaye aur uska jo argument hai wo arrayu hai ki nh h
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  if (!avatarLocalPath) {
    // agar nahi hai avavtar to error message do ki avatar chaiye hai
    throw new apiError(400, 'Avatar file is required');
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  // yahahn jo local path (yahi multer ka khud ka jo server hai) uspar agar upload hua hai to wo path le k cloudinary par upload kar do
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, 'Avatar file is required');
  }
  const user = await User.create({
    // yahan se sara chz enter ho jayega
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || '',
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    '-password -refreshToken'
    // yahan humko password aur refresh token nahi chahiye isliye isme "-password" laga hai
  );
  if (!createdUser) {
    throw new apiError(500, 'Something went wrong while registering the user');
  }
  return res
    .status(201)
    .json(new apiResponse(200, createdUser, 'User registered Successfully'));
});

const loginUser = asyncHandler(async (req, res) => {
  // re body ->
  // username or email
  //find the user
  // password check
  // access and refresh token
  // send cookies
  const { email, username, password } = req.body;
  if (!username && !email) {
    throw new apiError(400, 'username or email is required');
  }
  // OR

  // if (!username || !email) {
  //   throw new apiError(400, "username or email is required");
  // }

  const user = await User.findOne({
    $or: [{ username }, { email }], // ya to username ya to email
  });
  if (!user) {
    throw new apiError(404, 'User does not exists');
  }
  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new apiError(401, 'Invalid user credentials');
  }

  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    '-password -refreshToken'
  );
  const options = {
    // only for sending cookies
    httpOnly: true,
    // is dono k matlab hai ki only cookies server se modifiable hogi , frontend se isko koi kuch nahi kar skta.
    secure: true,
  };

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(
      new apiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        'User logged In Successfully'
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1, // this removes the field from document
      },
    },
    {
      new: true,
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie('accessToken', options)
    .clearCookie('refreshToken', options)
    .json(new apiResponse(200, {}, 'User logged Out'));
});
// we use refresh token and access token for not give username and password each n every time.
// refresh token always save in databse

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new apiError(401, 'unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new apiError(401, 'Invalid refresh token');
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      throw new apiError(401, 'Refresh token is expired or used');
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessAndRefereshTokens(user._id);

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .cookie('refreshToken', newRefreshToken, options)
      .json(
        new apiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          'Access token refreshed'
        )
      );
  } catch (error) {
    throw new apiError(401, error?.message || 'Invalid refresh token');
  }

  const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id);
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);

    if (!isPasswordCorrect) {
      throw new apiError(400, 'Invalid old password');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
      .status(200)
      .json(new apiResponse(200, {}, 'Password changed successfully'));
  });

  const getCurrentUser = asyncHandler(async (req, res) => {
    return res
      .status(200)
      .json(new apiResponse(200, req.user, 'User fetched successfully'));
  });
  const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullname || !email) {
      throw new apiError(400, 'All fields are required');
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          fullname: fullname,
          email: email,
        },
      },
      { new: true }
    ).select('-password');

    return res
      .status(200)
      .json(new apiResponse(200, user, 'Account details updated successfully'));
  });
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, 'Avatar file is missing');
  }

  //TODO: delete old image - assignment

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new apiError(400, 'Error while uploading on avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new apiResponse(200, user, 'Avatar image updated successfully'));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) {
    throw new ApiError(400, 'Cover image file is missing');
  }

  //TODO: delete old image - assignment

  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!coverImage.url) {
    throw new apiError(400, 'Error while uploading on avatar');
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    { new: true }
  ).select('-password');

  return res
    .status(200)
    .json(new apiResponse(200, user, 'Cover image updated successfully'));


});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;
  // "req.params" matlab jo bhi data milega wo direct uske url se milega
  if (!username?.trim()) {
    throw new apiError(400, 'username is missing');
  }
  const channel = await User.aggregate([
    {
      // pipeline
      $match: {
        // $match ka kaam hai ki sare data jo bhi databse m store hai usme se wo particular chz find karega
        username: username?.toLowerCase(),
      },
    },
    {
      $lookup: {
      // "$lookup" operator is used to perform a "join" between two collections  
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'channel',
        as: 'subscribers',
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: '_id',
        foreignField: 'subscriber',
        as: 'subscribedTo',
      },
    },
    {
      $addFields: {
        // dono lookup ko add kar k ek naay feild banna hai
        subscribersCount: {
          $size: '$subscribers', // yahan "$subscribers" isliye like hsi q ki ye ek fields hai
        },
        channelsSubscribedToCount: {
          $size: 'subscribedTo',
        },
        isSubscribed: {
          $cond: {
            if: {
              $in: [req.user?._id, 'subscribers.subscriber'],
              // $in array mai aur object mai dono m dekhta hai ki data wahan hai ki nahi
            },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      // $project isliye use hota hai ki db mai hai to bahut sara chz ab un m se humko ky ky chaiye wo bata do to main sirf wahi wahi chz dunga.
      $project: {
        fullname: 1,
        username: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
        email: 1,
      },
    },
  ]);
  if (!channel?.length) {
    throw new apiError(404, 'channel doesnot exists');
  }
  return res
    .status(200)
    .json(
      new apiResponse(200, channel[0], 'user channel fetched successfully')
      // "channel[0]" iska matlab hai channel mai jo bhi xhz store hai sab bhj rhe hai frontend m
    );


  // TODOs:- channel ko console kar k dekhna hai
});

const getWatchHistory = asyncHandler(async(req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id"
        as: "watchHistory",
        // nested pipeline k lye aise likhe hai
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id"
              as: "owner",
              // yahan agar "owner" wala hai to usme sara data jayega isliye hum ky karenge "$project" lagayenge taki humko jo aur jitna chaiye wahi aur utna hi mile
              pipeline: [
                {
                  $project: {
                    fullName: 1,
                    username: 1,
                    avatar: 1
                  }
                }
                // yahan ye is tarh se isliye use kiye hai taki array aa rha hai aur array main se first value chahiye to usko aise aggregate k through nikal sakte hai rather than wo use karne k
                $addFields: {
                  owner: {
                    $First: "$owner"
                  }
                }
              ]
          }
        ]
      }
    },
  ])
  return res.status(200).json(new apiResponse(200, user[0].watchHistory, "Watch History fetched successfully"))
  // "user[0].watchHistory" ye aise like hai q ki user k feild k andar se watch history nikalana hai srf

});

  
  

export {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  changeCurrentPassword,
  getCurrentUser,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory
};
