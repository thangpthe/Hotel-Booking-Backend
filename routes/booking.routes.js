import express from "express";
import { isAuthenticated } from "../middllewares/isAuthenticated.js";
import {isOwner} from "../middllewares/isOwner.js";
import { bookRoom, checkRoomAvailability, getHotelBookings, getUserBookings, stripePayment } from "../controllers/booking.controller.js";

const bookingRouter = express.Router();
bookingRouter.post("/check-availability",checkRoomAvailability);
bookingRouter.post("/book",isAuthenticated,bookRoom);
bookingRouter.get("/user",isAuthenticated,getUserBookings);
bookingRouter.get("/hotel",isAuthenticated,isOwner,getHotelBookings);
bookingRouter.post("/stripe-payment",isAuthenticated,stripePayment);
// bookingRouter.delete("/delete/:bookingId",isAuthenticated,isOwner,deletebooking);

export default bookingRouter;