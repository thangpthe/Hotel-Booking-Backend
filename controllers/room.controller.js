// import Room from "../models/room.model.js";
// import Booking from "../models/booking.model.js";
// export const addRoom = async (req,res) => {
//     try {
//         const {roomType,hotel,pricePerNight,description,amenities,isAvailable} = req.body;
        
       
//         const images = req.files?.map((file) => file.filename) || [];
        
//         if (images.length === 0) {
//             return res.status(400).json({
//                 message: "Please upload at least one image", 
//                 success: false
//             });
//         }
        
//         const newRoom = await Room.create({
//             roomType,
//             hotel,
//             pricePerNight,
//             description,
//             amenities,
//             isAvailable,
//             images: images, 
//         })
        
//         return res.status(201).json({
//             message: "Room added successfully",
//             success: true,
//             room: newRoom
//         })
//     } catch (error) {
//         console.log("Error:", error);
//         return res.status(500).json({
//             message: "Internal server error", 
//             success: false,
//             error: error.message
//         });
//     }
// }
// export const getOwnerRooms = async (req,res) => {
//     try {
//         const {id} = req.user;
//         const rooms = await Room.find().populate({
//             path: "hotel",
//             match: {owner:id},
//             select: "hotel hotelAddress rating amenities",
//         });
//         const ownerRooms = rooms.filter(room => room.hotel.owner !== id);
//         return res.status(200).json({rooms,success:true});
//     } catch (error) {
//         return res.status(500).json({message: "Internal server error"});
//     }
// }

// export const getAllRooms = async (req,res) => {
//     try {
//         const rooms = await Room.find().populate({
//             path: "hotel",
//             select: "hotelName hotelAddress amenities rating owner",
//             populate: {
//                 path:"owner",
//                 select: "name email",
//             },
//         })
//         .exec();
//         return res.status(200).json({rooms,success:true});
//     } catch (error) {
//         return res.status(500).json({message: "Internal server error"});
//     }
// }

// export const deleteRoom = async (req,res) => {
//     try {
//         const {roomId} = req.params;
//         const deleteRoom = await Room.findByIdAndDelete(roomId);
//         if(!deleteRoom){
//             return res.status(404).json({message: "Room not found"});
//         }
//         return res.status(200).json({message: "Room deleted successfully"});
//     } catch (error) {
//         return res.status(500).json({message: "Internal server error"});
//     }
// }


// // room.controller.js - Enhanced version
// export const updateRoom = async (req, res) => {
//     try {
//         const { roomId } = req.params;
//         const { 
//             hotel, 
//             roomType, 
//             pricePerNight, 
//             description, 
//             amenities, 
//             isAvailable,
//             keepExistingImages  // Array of existing image filenames to keep
//         } = req.body;
        
//         const room = await Room.findById(roomId).populate('hotel');
        
//         if (!room) {
//             return res.status(404).json({
//                 message: "Room not found",
//                 success: false
//             });
//         }
        
//         // Check authorization
//         if (room.hotel.owner.toString() !== req.user.id) {
//             return res.status(403).json({ 
//                 message: "You are not authorized to update this room", 
//                 success: false 
//             });
//         }
        
//         // Update fields
//         if (roomType) room.roomType = roomType;
//         if (pricePerNight) room.pricePerNight = pricePerNight;
//         if (description) room.description = description;
//         if (amenities) room.amenities = amenities;
//         if (typeof isAvailable !== 'undefined') room.isAvailable = isAvailable;
//         if (hotel) room.hotel = hotel;
        
//         // Handle images
//         let updatedImages = [];
        
//         // Keep existing images if specified
//         if (keepExistingImages) {
//             const imagesToKeep = Array.isArray(keepExistingImages) 
//                 ? keepExistingImages 
//                 : JSON.parse(keepExistingImages);
//             updatedImages = [...imagesToKeep];
//         }
        
//         // Add new images
//         if (req.files && req.files.length > 0) {
//             const newImages = req.files.map(file => file.filename);
//             updatedImages = [...updatedImages, ...newImages];
//         }
        
//         // Update images array if there are any changes
//         if (updatedImages.length > 0) {
//             room.images = updatedImages;
//         }
        
//         await room.save();
//         await room.populate('hotel');
        
//         return res.json({
//             message: "Room updated successfully",
//             success: true,
//             room
//         });
        
//     } catch (error) {
//         console.error("Update room error:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             success: false,
//             error: error.message
//         });
//     }
// }

// export const getRoomById = async (req, res) => {
//     try {
//         const { id } = req.params;
        
//         const room = await Room.findById(id)
//             .populate({
//                 path: "hotel",
//                 select: "hotelName hotelAddress amenities rating owner",
//                 populate: {
//                     path: "owner",
//                     select: "name email phone"
//                 }
//             })
//             .exec();
        
//     //     if (!room) {
//     //         return res.status(404).json({
//     //             message: "Room not found",
//     //             success: false
//     //         });
//     //     }
        
//     //     return res.status(200).json({
//     //         room,
//     //         success: true
//     //     });
//     // } catch (error) {
//     //     console.log("Error:", error);
//     //     return res.status(500).json({
//     //         message: "Internal server error",
//     //         success: false
//     //     });
//     // }
//         const now = new Date();
//         const currentBooking = await Booking.findOne({
//             room: room._id,
//             checkIn: { $lte: now },
//             checkOut: { $gt: now },
//         });

//         const isOccupied = !!currentBooking;
//         if (room.isAvailable === isOccupied) { 
//             room.isAvailable = !isOccupied;
//             await room.save();
//             console.log(`Auto-updated Room ${room.roomType}: ${room.isAvailable ? 'Available' : 'Occupied'}`);
//         }

//         return res.status(200).json({ success: true, room });

//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({ success: false, message: "Internal server error" });
//     }
// }

import Room from "../models/room.model.js";
import Booking from "../models/booking.model.js";
import Hotel from "../models/hotel.model.js"; // ← IMPORTANT: Add this import

export const addRoom = async (req, res) => {
    try {
        const { roomType, hotel, pricePerNight, description, amenities, isAvailable } = req.body;
        
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
        });
        
        return res.status(201).json({
            message: "Room added successfully",
            success: true,
            room: newRoom
        });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({
            message: "Internal server error", 
            success: false,
            error: error.message
        });
    }
};

// ✅ FIXED VERSION
export const getOwnerRooms = async (req, res) => {
    try {
        const { id } = req.user;
        
        console.log("🔍 Fetching rooms for owner:", id);
        
        // Step 1: Get all hotels owned by this user
        const hotels = await Hotel.find({ owner: id }).select('_id');
        
        if (!hotels || hotels.length === 0) {
            console.log("⚠️ No hotels found for this owner");
            return res.status(200).json({
                rooms: [],
                success: true,
                message: "No hotels found. Please add a hotel first."
            });
        }
        
        const hotelIds = hotels.map(h => h._id);
        console.log("🏨 Owner's hotel IDs:", hotelIds);
        
        // Step 2: Get all rooms from those hotels
        const rooms = await Room.find({ hotel: { $in: hotelIds } })
            .populate({
                path: "hotel",
                select: "hotelName hotelAddress rating amenities owner"
            })
            .sort({ createdAt: -1 })
            .exec();
        
        console.log("✅ Found owner rooms:", rooms.length);
        
        return res.status(200).json({
            rooms,
            success: true,
            count: rooms.length
        });
        
    } catch (error) {
        console.error("❌ Error in getOwnerRooms:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

export const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().populate({
            path: "hotel",
            select: "hotelName hotelAddress amenities rating owner",
            populate: {
                path: "owner",
                select: "name email",
            },
        })
        .exec();
        
        return res.status(200).json({
            rooms,
            success: true
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const deletedRoom = await Room.findByIdAndDelete(roomId);
        
        if (!deletedRoom) {
            return res.status(404).json({
                message: "Room not found"
            });
        }
        
        return res.status(200).json({
            message: "Room deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            message: "Internal server error"
        });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { 
            hotel, 
            roomType, 
            pricePerNight, 
            description, 
            amenities, 
            isAvailable,
            keepExistingImages
        } = req.body;
        
        console.log("📝 Updating room:", roomId);
        
        const room = await Room.findById(roomId).populate('hotel');
        
        if (!room) {
            return res.status(404).json({
                message: "Room not found",
                success: false
            });
        }
        
        // Check authorization
        if (room.hotel.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ 
                message: "You are not authorized to update this room", 
                success: false 
            });
        }
        
        // Update fields
        if (roomType) room.roomType = roomType;
        if (pricePerNight) room.pricePerNight = pricePerNight;
        if (description) room.description = description;
        if (amenities) room.amenities = amenities;
        if (typeof isAvailable !== 'undefined') room.isAvailable = isAvailable;
        if (hotel) room.hotel = hotel;
        
        // Handle images
        let updatedImages = [];
        
        // Keep existing images if specified
        if (keepExistingImages) {
            try {
                const imagesToKeep = Array.isArray(keepExistingImages) 
                    ? keepExistingImages 
                    : JSON.parse(keepExistingImages);
                updatedImages = [...imagesToKeep];
            } catch (e) {
                console.error("Error parsing keepExistingImages:", e);
            }
        }
        
        // Add new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.filename);
            updatedImages = [...updatedImages, ...newImages];
            console.log("🖼️ Added new images:", newImages);
        }
        
        // Update images array if there are any changes
        if (updatedImages.length > 0) {
            room.images = updatedImages;
        }
        
        await room.save();
        await room.populate('hotel');
        
        console.log("✅ Room updated successfully");
        
        return res.json({
            message: "Room updated successfully",
            success: true,
            room
        });
        
    } catch (error) {
        console.error("❌ Update room error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};

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
        
        if (!room) {
            return res.status(404).json({
                message: "Room not found",
                success: false
            });
        }
        
        // Check current booking status
        const now = new Date();
        const currentBooking = await Booking.findOne({
            room: room._id,
            checkIn: { $lte: now },
            checkOut: { $gt: now },
        });

        const isOccupied = !!currentBooking;
        
        // Auto-update availability if status doesn't match
        if (room.isAvailable === isOccupied) { 
            room.isAvailable = !isOccupied;
            await room.save();
            console.log(`🔄 Auto-updated Room ${room.roomType}: ${room.isAvailable ? 'Available' : 'Occupied'}`);
        }

        return res.status(200).json({ 
            success: true, 
            room 
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};