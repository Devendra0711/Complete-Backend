import { Router } from 'express';
import {
  refreshAccessToken,
  registerUser,
  updateUserAvatar,
  updateUserCoverImage,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/register').post(
  upload.fields([
    // ye middlewares hai .... niche jo method call ho rha hai usse pehle middleware lagana hai.
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route('/login').post(loginUser);

// secured routes
router.route('/logout').post(verifyJWT, logoutUser),
  router.route('/refresh-token').post(refreshAccessToken),
  router.route('/change-password').post(verifyJWT, changeCurrentPassword),
  router.route('/change-user').get(verifyJWT, getCurrentUser),
  router.route('/update-account').patch(verifyJWT, updateAccountDetails),
  // PATCH meaning that only the fields that need to be changed are sent in the request body
  router
    .route('/avatar')
    .patch(verifyJWT, upload.single('avatar'), updateUserAvatar),
  router
    .route('cover-image')
    .patch(verifyJWT, upload.single('/avatar'), updateUserCoverImage),
  router.route('/channel/:username').get(verifyJWT, getUserChannelProfile),
  // "/channel/:username" channel m se username nikalna hai
  router.route('/history').get(verifyJWT, getWatchHistory);
export default router;
