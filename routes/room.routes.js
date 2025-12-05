import express from "express";
import { isAuthenticated } from "../middllewares/isAuthenticated.js";
import {isOwner} from "../middllewares/isOwner.js";
import { upload } from "../config/multer.js";
import { addRoom, deleteRoom, getAllRooms, getOwnerRooms, getRoomById, updateRoom } from "../controllers/room.controller.js";
const roomRouter = express.Router();
roomRouter.post("/add",upload.array("images"),isAuthenticated,isOwner,addRoom);

roomRouter.get("/get",isAuthenticated,isOwner,getOwnerRooms);
roomRouter.get("/get-all",getAllRooms);
roomRouter.get("/:id",getRoomById);
roomRouter.delete("/delete/:roomId",isAuthenticated,isOwner,deleteRoom);
// roomRouter.put("/update/:roomId",isAuthenticated,isOwner,updateRoom);

roomRouter.put("/update/:roomId", upload.array("images"), isAuthenticated, isOwner, updateRoom);


export default roomRouter;