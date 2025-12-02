import { Router } from 'express';
import {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeuserCurrentPassword,
    updateAccountDetails,
    getCurrentUser,
    getUserWatchHistory,
    udpatecoverImage,
    updateUserAvatar,
    getUserChannelProfile
}
    from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { varifyJWT } from '../middlewares/auth.middleware.js'



const router = Router();

router.route("/register").post(upload.fields([
    {
        name: "avatar",
        maxCount: 1
    },
    {
        name: "coverImage",
        maxCount: 1

    }
]),
    registerUser
);

router.route("/login").post(loginUser);


// secured routes

router.route("/logout").post(varifyJWT, logoutUser);

router.route("/refresh-Token").post(refreshAccessToken);
router.route("/getCurrentUser").post(varifyJWT, getCurrentUser);
router.route("/ChangePassword").patch(varifyJWT, changeuserCurrentPassword);

router.route("/UpdateDetails").patch(varifyJWT, updateAccountDetails);

router.route("/avatar").patch(varifyJWT, upload.single("avatar"), updateUserAvatar),

router.route("/coverImage").patch(varifyJWT, upload.single("coverImage"), udpatecoverImage),

router.route("/channel/:username").get(varifyJWT, getUserChannelProfile);

router.route("/history").get(varifyJWT, getUserWatchHistory);



export default router;