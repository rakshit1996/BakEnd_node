import {Router} from 'express';
import { registerUser,loginUser, logoutUser,refreshAccessToken,changeuserCurrentPassword ,updateAccountDetails,getCurrentUser} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {varifyJWT} from '../middlewares/auth.middleware.js'



const router = Router();

router.route("/register").post(upload.fields([
    {
        name : "avatar",
        maxCount: 1
    },
    {
        name : "coverImage",
        maxCount : 1

    }
    ]),
    registerUser
);

router.route("/login").post(loginUser);
router.route("/UpdateDetails").post(varifyJWT,updateAccountDetails);


// secured routes

router.route("/logout").post(varifyJWT,logoutUser);

router.route("/refresh-Token").post(refreshAccessToken);
router.route("/getCurrentUser").post(varifyJWT,getCurrentUser);
router.route("/ChangePassword").post(varifyJWT,changeuserCurrentPassword);



export default router;