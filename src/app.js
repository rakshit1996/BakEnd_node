import express from 'express';
import cookieParser from "cookie-parser";
import cors from 'cors';

const app = express();


// using  Cors middleware cofig
app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials:true
}));

// To use body-parsing middleware to populate req.body
app.use(express.json({limit:"16kb"}));

// the url data comes in
// https://expressjs.com/en/5x/api.html#express.urlencoded
app.use(express.urlencoded({extended: true, limit:"16kb"}));

// cookie parser
app.use(cookieParser());
// Public assets
app.use(express.static("public"));

// ----------------------------------------------
// Routes import

import userRouter from './routes/user.routes.js';


// routes declaration
app.use("/api/v1/users",userRouter);
// http://localhost:8000/api/v1/users/register



export {app};