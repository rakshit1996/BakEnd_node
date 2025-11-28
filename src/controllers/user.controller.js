import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadonCloudinary} from '../utils/cloudnary.js';
import {ApiResponse}  from '../utils/AprResponse.js';

const registerUser = asyncHandler(async (req,res)=>{
    
    //Step1: get details from the user 

    const {fullname , email, username , password } = req.body
     // validation -(not empty)
    if(
        [fullname,username,email,password].some((field) => field?.trim() === "")  // some methode check if any of the fields are empty if yes then retuen boolean
    ){
        throw new ApiError(400,"Mandetory fields is required")
    }

    
    // check if user is already existing ( username and email)
    const existedUser  = await User.findOne({
        $or: [{email}, {username}]
    })

    if (existedUser){
        throw new ApiError(409,"user with email or username is already exists");   
    }

    // check for images, check for avatar
    
    const avatartLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatartLocalPath){
        throw new ApiError(400,"avatar file is required")
    }
    // upload them to cloudnary,avatart
    const avataroncloud = await uploadonCloudinary(avatartLocalPath);
    const coverImage = await uploadonCloudinary(coverImageLocalPath);
    if(!avataroncloud){
        throw new ApiError(400,"avatar file is required");
        
    }
    //create user object -create entry in db
    const userdetails = await User.create({
        fullname,
        avatar:avataroncloud.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    });
   
    // remove password and refresh token field from the response  check for user creation and return response
     const createdUser = await User.findById(userdetails._id).select(
        "-password -refreshToken"
    );  
      console.log('useris created',createdUser)
   
    if(!createdUser){
        throw new ApiError(500,"User could not be registerd ; something went wrong")
    }
    {
        return res.status(201).json(
            new ApiResponse(200,createdUser,"user registered Successfully")
        )
    }
    

});

export {registerUser};