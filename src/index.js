import connectDB from "./db/index.js";
import dotenv from 'dotenv';
import {app} from './app.js';


dotenv.config({ 
    path: '.env' 
});

// execute methode to connect to db
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(` App is running on :: ${process.env.PORT}`)
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed!!",err);
    
});


/* ------------------------- another way to connect to db immediatly in this files - we moved this connection db/index
import express from "express";
const app = express();

(async()=>{
try {
     await mongoose.connect(`${process.env.MONGODB_URI}/
        ${DB_NAME}`)
        app.on("error",(error) => {
            console.log("Error:",error);
            throw error
        })
        app.listen(process.env.PORT,()=>{
            console.log(`The application is running on ${process.env.PORT}`)
        })
} catch (error) {
    console.log("Error:",error);
    throw error;
}
})();

*/