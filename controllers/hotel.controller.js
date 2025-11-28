import Hotel from "../models/hotel.model.js";

export const registerHotel = async (req,res) => {
    const {id} = req.user;
    try {
        const {hotelName,hotelAddress,rating,price,amenities} = req.body;
        const image = req.file.filename;
        if(!hotelName || !hotelAddress || !rating || !price || !amenities || !image){
            return res.status(400).json({message: "All fields are required", success: false});
        }
        const newHotel = new Hotel({
            hotelName,
            hotelAddress,
            rating,
            price,
            amenities,
            image,
            owner: id,
        })
        await newHotel.save();
        return res.status(201).json({message: "Hotel registered successfully",success: true})
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getOwnerHotels = async (req,res) => {
    const {id} = req.user;
    try {
        const hotels = await Hotel.find({owner: id}).populate("owner","name email");
        return res.status(200).json({hotels,success:true});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getAllHotels = async (req,res) => {
    try {
        const hotels = await Hotel.find().populate("owner","name email");
        return res.status(200).json({hotels,success:true});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const deleteHotel = async (req,res) => {
    const {hotelId} = req.params;
    try {
        const deleteHotel = await Hotel.findByIdAndDelete(hotelId);
        if(!deleteHotel){
            return res.status(404).json({message: "Hotel not found"});
        }
        return res.status(200).json({message: "Hotel deleted successfully"});
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

// hotel.controller.js

// Get single hotel with all its rooms
export const getHotelById = async (req, res) => {
    try {
        const { id } = req.params;
        

        const hotel = await Hotel.findById(id).populate("owner", "name email phone");
        
        if (!hotel) {
            return res.status(404).json({
                message: "Hotel not found",
                success: false
            });
        }

        const rooms = await Room.find({ hotel: id }).select('-__v');
        
        return res.status(200).json({
            success: true,
            hotel,
            rooms,
            roomCount: rooms.length
        });
        
    } catch (error) {
        console.error("Error fetching hotel:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
};