import transporter from "../config/nodemailer.js";
import Booking from "../models/booking.model.js";
import Hotel from "../models/hotel.model.js";
import Room from "../models/room.model.js";
import User from "../models/user.model.js";
import Stripe from "stripe";
//
export const checkAvailability = async ({room,checkInDate,checkOutDate}) => {
    try {
        const booking = await Booking.find({room,checkInDate: { $lte: checkOutDate},checkOutDate: {$gte: checkInDate}});
        const isAvailable = booking.length === 0;
        return isAvailable;
    } catch (error) {
        console.log(error);
    }
}

//check room availability
export const checkRoomAvailability = async (req,res) => {
    try {
        const {room,checkInDate,checkOutDate} = req.body;
        const isAvailable = await checkAvailability({room,checkInDate,checkOutDate});

        return res.json({success: true,isAvailable})
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

//book a room
export const bookRoom = async (req,res) => {
    try {
        const {id} = req.user;
        const user = await User.findById(id);
        const {room,checkInDate,checkOutDate,persons,paymentMethod} = req.body;
        const isAvailable = await checkAvailability({room,checkInDate,checkOutDate});
        if(!isAvailable){
            return res.status(400).json({message: "Room is not available",success:false});
        }
        const roomData = await Room.findById(room).populate("hotel");
        let totalPrice = roomData.pricePerNight;
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        totalPrice = totalPrice * nights * persons;

        const booking = await Booking.create({
            user : id,
            room,
            hotel: roomData.hotel._id,
            checkIn,
            checkOut,
            persons,
            totalPrice,
            paymentMethod
        })
        const now = new Date();
        if (new Date(checkInDate) <= now && new Date(checkOutDate) > now) {
            await Room.findByIdAndUpdate(room, { isAvailable: false });
        }
    //  try {
    //         const mailOptions={
    //             from: process.env.SENDER_EMAIL,
    //             to: user.email,
    //             subject: "Room booked successfully",
    //             html: `
    //             <h1>Hotel Booking Confirmation</h1>
    //             <p>Dear ${user.name},</p>
    //             <p>Thank you for booking with us. Your booking details are as follows:</p>
    //             <ul>
    //                 <li>Booking ID: ${booking._id}</li>
    //                 <li>Hotel: ${roomData.hotel.hotelName}</li>
    //                 <li>Room Type: ${roomData.roomType}</li>
    //                 <li>Check in Date: ${checkInDate}</li>
    //                 <li>Check out Date: ${checkOutDate}</li>
    //                 <li>Number of Persons: ${persons}</li>
    //                 <li>Total Price: ${process.env.CURRENCY || "$"} ${totalPrice}</li>
    //             </ul>
    //             `,
    //         };
    //         await transporter.sendMail(mailOptions);
    //     } catch (emailError) {
    //         console.error("Email sending failed:", emailError);
    //     }
        return res.status(200).json({
            success: true, 
            message: "Room booked successfully!",
            booking: {
                id: booking._id,
                totalPrice: totalPrice
            }
        });
        
    } catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false,
            error: error.message
        });
    }
}

export const getUserBookings = async (req,res) => {
    try {
        const {id} = req.user;
        const bookings = await Booking.find({user: id}).populate("hotel room").sort({createdAt: -1});
        return res.json({success: true, bookings})
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const getHotelBookings = async (req,res) => {
    try {
        const {id} = req.user;
        const hotels = await Hotel.find({owner: id}).select("_id");
        if(!hotels){
            return res.status(404).json({message: "Hotel not found",success:false});
        }
        const hotelId = hotels.map((hotel) => hotel._id);
        const bookings= await Booking.find({hotel: {$in: hotelId}}).populate("room hotel").sort({createdAt: -1});

        if(bookings.length === 0){
            return res.status(404).json({message: "Bookings not found",success: false});
        }
        else{
            return res.json({success: true,bookings});
        }
        return res.json({success: true, bookings})
    } catch (error) {
        return res.status(500).json({message: "Internal server error"});
    }
}

export const stripePayment = async (req, res) => {
    try {
        const { bookingId } = req.body;
        
        // 1. Validate input
        if (!bookingId) {
            return res.status(400).json({ success: false, message: "Booking ID is required" });
        }

        // 2. Lấy thông tin Booking
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).json({ success: false, message: "Booking not found" });
        }

        // 3. Lấy thông tin Room & Hotel
        const roomData = await Room.findById(booking.room).populate("hotel");
        if (!roomData || !roomData.hotel) {
            return res.status(404).json({ success: false, message: "Room or Hotel not found" });
        }

        const clientUrl = process.env.CLIENT_URL || req.headers.origin || 'http://localhost:5173';

        const totalPrice = booking.totalPrice;

        // 5. Khởi tạo Stripe
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        // 6. Tạo Line Items
        const line_items = [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: roomData.hotel.hotelName,
                        description: `${roomData.roomType} (${booking.persons} guests)`,
                    },
                    unit_amount: Math.round(totalPrice * 100),
                },
                quantity: 1,
            }
        ];

        // 7. Tạo Checkout Session
        const session = await stripeInstance.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: "payment",
            success_url: `${clientUrl}/my-bookings?payment=success&bookingId=${bookingId}`,
            cancel_url: `${clientUrl}/my-bookings?payment=cancelled`,
            metadata: {
                bookingId: bookingId.toString(),
            },
            client_reference_id: bookingId.toString(),
        });

       
        await Booking.findByIdAndUpdate(bookingId, {
            isPaid: true,
            status: "confirmed" 
        });

        // Trả về URL để frontend redirect
        return res.json({ 
            success: true, 
            url: session.url,
            sessionId: session.id 
        });

    } catch (error) {
        console.error(" Stripe Payment Error:", error); 
        return res.status(500).json({ 
            success: false, 
            message: "Payment processing failed", 
            error: error.message 
        });
    }
}