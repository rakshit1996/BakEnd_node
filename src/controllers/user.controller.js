import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiError} from '../utils/ApiError.js';
import {User} from '../models/user.model.js';
import {uploadonCloudinary} from '../utils/cloudnary.js';
import {ApiResponse}  from '../utils/AprResponse.js';
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefresgTokens = async(userId)=>{
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken =  user.generateRefreshToken();
        // save access and refresh token in db
        user.refreshToken = refreshToken; 
        await user.save({validateBeforeSave:false});

        return {accessToken,refreshToken};
    } catch (error)
     {
        throw new ApiError(500,"something went wrong whhile generating refresh and access token")
    }
};


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
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;


    // the validation for the empty coverimage calls
    let coverImageLocalPath ;

    if(req.files && Array.isArray(req.files.coverImage) &&  req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    // console.log(req.files);

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
    //   console.log('useris created',createdUser)
   
    if(!createdUser){
        throw new ApiError(500,"User could not be registerd ; something went wrong")
    }
    {
        return res.status(201).json(
            new ApiResponse(200,createdUser,"user registered Successfully")
        )
    }
    

});

const loginUser = asyncHandler(async(req,res)=>{
    // req body ->data
    // username or email
    // find user 
    // check password
    // acess and refresh
    // send cookie

    // requesting the fields from reqbody
    const {username , email, password} = req.body;
    
    // console.log(req.body) body consists of input from the user 

    // user name or email is required for login
    if(!(username || email)){
        throw new ApiError(400, "username or email is required")
    };
   
    const user = await User.findOne({
        $or : [{username},{email}]
    })
     
    if(!user){
        throw new ApiError(404,"user does not exists")
    }
    // console.log(user);

    const isPasswordValid = await user.isPasswordCorrect(password);
    if(!isPasswordValid){
        throw new   ApiError(401,"Invalid password")
    }

    //  run the function to create access and refresh token for user id
    const {refreshToken,accessToken}  = await generateAccessTokenAndRefresgTokens(user._id);

    // db call to find the user to compare the tokens
    const loggedInUser = await User.findById(user._id)
                            .select("-password -refreshToken");

    const options = {
                    httpOnly : true,
                    secure : true
                    };
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)  // setting access token
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse( 200,
                         {user: loggedInUser,accessToken,refreshToken},
                         "user Logged in sucessfully"
                        )
    );


                


});

const logoutUser =  asyncHandler(async(req,res)=>{

    //  to logout user we need to clear cookies and refreshtoken 

    //How to read User from here since there is no user input logout: midle ware concept is used to logout user  --- (since we do not have user form to logout we need to use the middle ware to read the user)
   await User.findOneAndUpdate(
        req.user._id,
        {
            $set :{
                refreshToken: undefined
            }
        },
        {
            new: true
        }

    );

    const options = {
        httpOnly : true,
        secure : true
    }
     return res
     .status(200)
     .clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"User logged out"))
})


const refreshAccessToken = asyncHandler( async(req, res)=>{
    try {

    const incomingRefreshToken    = req.cookies.refreshToken || req.body.refreshToken;
    if(!incomingRefreshToken){
        throw new ApiError(401,"Unauthorized request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,
               process.env.ACCESS_TOKEN_SECRET)
               
    const user = await findById(decodedToken?._id)
    if(!user){
        throw new ApiError(401,"Invalid refresh token")
    }

    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresg token is expired")
    }

    const options = {
                    httpOnly: true,
                    secure : true
                    }

    const {accessToken,newrefreshToken} = await generateAccessTokenAndRefresgTokens(user._id);
    
    return res.status(200)
             .cookie("accessToken",accessToken,options )
             .cookie("refreshToken",newrefreshToken,options)
             .json(new ApiResponse(
                200,
                {accessToken, refreshToken : newrefreshToken},
                "Access token refreshed"
             ))

    } catch (error) {
        throw new ApiError(401, error?.message || " No new refreshAccessToken")
    }

})

const changeuserCurrentPassword = asyncHandler( async(req,res)=>{
try {
    
        const {oldPassword,newPassword} = req.body;
    
         const user = await findById(req.user?._id);
    
        ispasswordCorrect = await user.isPasswordCorrect(oldPassword);
        if(!ispasswordCorrect){
            throw new ApiError(400, "Invalid old password")
        }
    
        user.password == newPassword;
        await user.save({validateBeforeSave:false});

        return res.status(200)
                .json( new ApiResponse(
                    200,
                    {},
                    "password change successfully"
                ))
                  

} catch (error) {
    throw new ApiError(400,error?.message,"Password chnage unsucessfull")
}

});


const getCurrentUser = asyncHandler( async(req,res) =>{
    return res.status(200)
              .json(new ApiResponse(200,req.user,"User details fetched successfully"))

})

const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname,email} = req.body
    // console.log(req.body);
    // console.log(req.user?._id);

    if(!fullname || !email) {
        throw new ApiError(400,"fullname and email are required")
    }
   const user = await User.findByIdAndUpdate(
                        req.user?._id,
                        {$set:
                                {
                                   fullname: fullname,
                                   email: email     
                                }
                        },
                        {new: true}
                    ).select("-password -refreshToken");
                      return  res.status(200)
                        .json(new ApiResponse(200,
                                            user,
                                            "Account details updated successfully"               
                                                ));

})

const updateUserAvatar = asyncHandler(async(req,res)=>{
      const avartarLocalPath =  req.file?.path
      
      if(!avartarLocalPath){
        throw new ApiError(400,"Avatar file is missing")
      }
      const avatar = await uploadonCloudinary(avartarLocalPath);

      if(!avatar.url){
        throw new ApiError(400,"Error while uploading avatar on claudinary")
      }

    const user =  await User.findByIdAndUpdate(req.user?._id,
                                     {
                                        $set:{
                                            avatar: avatar.url
                                        }
                                     },{new:true}).select("-password");
        return res. status(200)
            .json(new ApiResponse(
                200,
                user,
                "Avatar image successfully uploaded"
            ))
    });

const udpatecoverImage = asyncHandler(async(req,res)=>{
     const coverImageLocal    = req.file?.path;

     if(!coverImageLocal){
        throw new ApiError(400,"Coverimage is missing");
     }

     const coverImage = await uploadonCloudinary(coverImageLocal);

     if(!coverImage){
        throw new ApiError(400,"Error Uploading CoverImage");
     }
     const user = await User.findByIdAndUpdate(
                            req.user?._id,
                            {
                                $set :{
                                    coverImage: coverImage.url
                                }
                            },
                            {new:true}    
                            ).select("-password")
    return res. status(200)
            .json(new ApiResponse(
                200,
                user,
                "Cover imaage successfully uploaded"
            ))
});

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeuserCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    udpatecoverImage
    
    
};