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


// Update Booking
export const updateBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { checkInDate, checkOutDate, persons } = req.body;
        const { id: userId } = req.user;

        console.log(' Updating booking:', bookingId);

        // Find booking
        const booking = await Booking.findById(bookingId).populate('room');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check authorization - only booking owner can update
        if (booking.user.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to update this booking"
            });
        }

        // Check if booking is already paid
        if (booking.isPaid) {
            return res.status(400).json({
                success: false,
                message: "Cannot modify paid bookings. Please contact support."
            });
        }

        // Check if new dates overlap with existing bookings
        if (checkInDate && checkOutDate) {
            const isAvailable = await checkAvailability({
                room: booking.room._id,
                checkInDate,
                checkOutDate
            });

            if (!isAvailable) {
                return res.status(400).json({
                    success: false,
                    message: "Room is not available for the selected dates"
                });
            }
        }

        // Calculate new price if dates or persons changed
        let newTotalPrice = booking.totalPrice;
        
        if (checkInDate || checkOutDate || persons) {
            const checkIn = new Date(checkInDate || booking.checkIn);
            const checkOut = new Date(checkOutDate || booking.checkOut);
            const guestCount = persons || booking.persons;
            
            const timeDiff = checkOut.getTime() - checkIn.getTime();
            const nights = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
            
            const roomData = await Room.findById(booking.room._id);
            newTotalPrice = roomData.pricePerNight * nights * guestCount;
        }

        // Update booking
        booking.checkIn = checkInDate ? new Date(checkInDate) : booking.checkIn;
        booking.checkOut = checkOutDate ? new Date(checkOutDate) : booking.checkOut;
        booking.persons = persons || booking.persons;
        booking.totalPrice = newTotalPrice;

        await booking.save();
        await booking.populate('hotel room');

        console.log('Booking updated successfully');

        return res.json({
            success: true,
            message: "Booking updated successfully",
            booking
        });

    } catch (error) {
        console.error('Update booking error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to update booking",
            error: error.message
        });
    }
};

// Delete/Cancel Booking
export const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { id: userId, role } = req.user;

        console.log('🗑️ Deleting booking:', bookingId);

        // Find booking
        const booking = await Booking.findById(bookingId).populate('room hotel');
        
        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check authorization
        const isOwner = role === 'owner' && booking.hotel.owner.toString() === userId;
        const isBookingUser = booking.user.toString() === userId;

        if (!isOwner && !isBookingUser) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to delete this booking"
            });
        }

        // Check if booking can be cancelled
        const now = new Date();
        const checkInDate = new Date(booking.checkIn);
        
        // Cannot cancel if check-in is within 24 hours
        const hoursDifference = (checkInDate - now) / (1000 * 60 * 60);
        
        if (hoursDifference < 24 && hoursDifference > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel booking within 24 hours of check-in"
            });
        }

        // If already checked in, cannot cancel
        if (now >= checkInDate && now < new Date(booking.checkOut)) {
            return res.status(400).json({
                success: false,
                message: "Cannot cancel active booking. Please contact support."
            });
        }

        // Update booking status to cancelled instead of deleting
        booking.status = "Cancelled";
        await booking.save();

        // Update room availability if needed
        await Room.findByIdAndUpdate(booking.room._id, { isAvailable: true });

        console.log('Booking cancelled successfully');

        return res.json({
            success: true,
            message: "Booking cancelled successfully"
        });

    } catch (error) {
        console.error('Delete booking error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to cancel booking",
            error: error.message
        });
    }
};