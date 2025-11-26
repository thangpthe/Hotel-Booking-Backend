import mongoose from "mongoose";

const hotelSchema = new mongoose.Schema({
    hotelName:{
        type:String,
        required: true,
    },
    hotelAddress:{
        type:String,
        required: true,
    },
    rating:{
        type:String,
        required: true,
    },
    price:{
        type:String,
        required: true,
    },
    amenities: {
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    }
    },  {
        timestamps:true
    });

    const Hotel = mongoose.model("Hotel",hotelSchema);
    export default Hotel;