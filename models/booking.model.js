import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
   user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
   },
   hotel:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Hotel",
        required: true,
   },
   room:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Room",
        required: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    persons: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Confirmed","Pending", "Cancelled"],
        default: "Pending"
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    paymentMethod: {
        type: String,
        // enum : ["Stripe", "Pay At Hotel"],
        default: "Pay At Hotel",
        required: true
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    },  {
        timestamps:true
    });

    const Booking = mongoose.model("Booking",bookingSchema);
    export default Booking;