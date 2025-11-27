import connectDB from "./db/index.js";
import dotenv from 'dotenv';


dotenv.config({ 
    path: '.env' 
});

// execute methode to connect to db
connectDB();


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