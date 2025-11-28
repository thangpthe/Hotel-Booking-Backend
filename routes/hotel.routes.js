import express from "express";
import { isAuthenticated } from "../middllewares/isAuthenticated.js";
import {isOwner} from "../middllewares/isOwner.js";
import { deleteHotel, getAllHotels, getHotelById, getOwnerHotels, registerHotel } from "../controllers/hotel.controller.js";
import { upload } from "../config/multer.js";
const hotelRouter = express.Router();
hotelRouter.post("/register",upload.single("image"),isAuthenticated,isOwner,registerHotel);

hotelRouter.get("/get",isAuthenticated,isOwner,getOwnerHotels);
hotelRouter.get("/get-all",getAllHotels);
hotelRouter.get("/:id", getHotelById);
hotelRouter.delete("/delete/:hotelId",isAuthenticated,isOwner,deleteHotel);

export default hotelRouter;