import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber :{
            type : Schema.Types.ObjectId,  // user 
            ref: "User"
        },
        channel:{
             type : Schema.Types.ObjectId, // video creator
            ref: "User"
        }
    },
{timestamps: true});



export const Subscipion = mongoose.model("Subscipion",subscriptionSchema)