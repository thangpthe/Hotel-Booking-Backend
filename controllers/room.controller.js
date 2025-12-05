import Room from "../models/room.model.js";
import Booking from "../models/booking.model.js";
export const addRoom = async (req,res) => {
    try {
        const {roomType,hotel,pricePerNight,description,amenities,isAvailable} = req.body;
        
       
        const images = req.files?.map((file) => file.filename) || [];
        
        if (images.length === 0) {
            return res.status(400).json({
                message: "Please upload at least one image", 
                success: false
            });
        }
        
        const newRoom = await Room.create({
            roomType,
            hotel,
            pricePerNight,
            description,
            amenities,
            isAvailable,
            images: images, 
        })
        
        return res.status(201).json({
            message: "Room added successfully",
            success: true,
            room: newRoom
        })
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            message: "Internal server error", 
            success: false,
            error: error.message
        });
    }
}
export const getOwnerRooms = async (req,res) => {
    try {
        const {id} = req.user;
        const rooms = await Room.find().populate({
            path: "hotel",
            match: {owner:id},
            select: "hotel hotelAddress rating amenities",
        });
        const ownerRooms = rooms.filter(room => room.hotel.owner !== id);
        return res.status(200).json({rooms,success:true});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getAllRooms = async (req,res) => {
    try {
        const rooms = await Room.find().populate({
            path: "hotel",
            select: "hotelName hotelAddress amenities rating owner",
            populate: {
                path:"owner",
                select: "name email",
            },
        })
        .exec();
        return res.status(200).json({rooms,success:true});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteRoom = async (req,res) => {
    try {
        const {roomId} = req.params;
        const deleteRoom = await Room.findByIdAndDelete(roomId);
        if(!deleteRoom){
            return res.status(404).json({message: "Room not found"});
        }
        return res.status(200).json({message: "Room deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

// room.controller.js

export const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const room = await Room.findById(id)
            .populate({
                path: "hotel",
                select: "hotelName hotelAddress amenities rating owner",
                populate: {
                    path: "owner",
                    select: "name email phone"
                }
            })
            .exec();
        
    //     if (!room) {
    //         return res.status(404).json({
    //             message: "Room not found",
    //             success: false
    //         });
    //     }
        
    //     return res.status(200).json({
    //         room,
    //         success: true
    //     });
    // } catch (error) {
    //     console.log("Error:", error);
    //     return res.status(500).json({
    //         message: "Internal server error",
    //         success: false
    //     });
    // }
        const now = new Date();
        const currentBooking = await Booking.findOne({
            room: room._id,
            checkIn: { $lte: now },
            checkOut: { $gt: now },
        });

        const isOccupied = !!currentBooking;
        if (room.isAvailable === isOccupied) { 
            room.isAvailable = !isOccupied;
            await room.save();
            console.log(`Auto-updated Room ${room.roomType}: ${room.isAvailable ? 'Available' : 'Occupied'}`);
        }

        return res.status(200).json({ success: true, room });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}
