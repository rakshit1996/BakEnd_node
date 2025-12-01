import {Router} from 'express';
import { registerUser,loginUser, logoutUser, refrehAccessToken } from '../controllers/user.controller.js';
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


// secured routes

router.route("/logout").post(varifyJWT,logoutUser);

    // --refresh token
router.route("/refreh-Token").post(refrehAccessToken);

export default router;