// import User from "../models/user.model.js";
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// const isProduction = process.env.NODE_ENV === "production";

// //SignUp

// export const SignUp = async (req,res) =>{
//     try{
//         const {name,email,password,role}= req.body;
//         if(!name || !email || !password || !role){
//             return res.json({message:"All fields are required",success:false});
//         }

//         const existingUser = await User.findOne({email});
//         if(existingUser){
//             return res.json({message:"User exists",success:false});
//         }

//         const hashPassword = await bcrypt.hash(password,10);
//         const newUser = new User({
//             name,
//             email,
//             password: hashPassword,
//             role,
//         })
//         await newUser.save();
//         return res.status(201).json({ message: "Account created successfully", success: true });
//     }catch(e){
//         console.error(e);
//         return res.status(500).json({ message: "Internal server error", success: false });
//     }
// }
    

// //Login




// export const Login = async (req, res) => {
//     try {
//         const { email, password } = req.body;
        
       
//         if (!email || !password) {
//             return res.status(400).json({ message: "All fields are required", success: false });
//         }

     
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ message: "User not found", success: false });
//         }

       
//         const isMatch = await bcrypt.compare(password, user.password);
        
       
//         if (!isMatch) { 
//             return res.status(400).json({ message: "Incorrect password", success: false });
//         }

      
//         if (!process.env.JWT_SECRET) {
//             throw new Error("Missing JWT_SECRET in .env file");
//         }

        
//         const token = jwt.sign(
//             { id: user._id, role: user.role },
//             process.env.JWT_SECRET,
//             { expiresIn: "1d" }
//         );

//        res.cookie("token", token, {
//             httpOnly: true,
//             maxAge: 24 * 60 * 60 * 1000,
            
//             sameSite: isProduction ? 'none' : 'lax',
//             secure: isProduction ? true : false ,
//             path: '/'
//         });

//         return res.status(200).json({ message: "Login successful", success: true, user });

//     } catch (error) {
//         console.error("LOGIN ERROR:", error.message); 
        
//         return res.status(500).json({ 
//             message: "Internal server error", 
//             success: false, 
//             error: error.message 
//         });
//     }
// }

// export const Logout = async (req, res) => {
//     try {
//         res.clearCookie("token", {
//             httpOnly: true,
//             sameSite: isProduction ? 'none' : 'lax',
//             secure: isProduction ? true : false
//         });
        
//         return res.status(200).json({ 
//             message: "Logout successful", 
//             success: true 
//         });
//     } catch (error) {
//         console.error("LOGOUT ERROR:", error);
//         return res.status(500).json({ 
//             message: "Internal server error", 
//             success: false 
//         });
//     }
// }

// export const GetProfile = async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id).select("-password"); 
        
//         if (!user) {
//             return res.status(404).json({ message: "User not found", success: false });
//         }

//         return res.status(200).json({ success: true, user });
//     } catch (error) {
//         return res.status(500).json({ message: "Server error", success: false });
//     }
// }

import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const isProduction = process.env.NODE_ENV === "production";

// SignUp
export const SignUp = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        if (!name || !email || !password || !role) {
            return res.status(400).json({ 
                message: "All fields are required", 
                success: false 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                message: "User already exists", 
                success: false 
            });
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role,
        });
        
        await newUser.save();
        
        return res.status(201).json({ 
            message: "Account created successfully", 
            success: true 
        });
    } catch (error) {
        console.error("SIGNUP ERROR:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false 
        });
    }
};

// Login
export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        console.log('🔐 Login attempt for:', email);
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                message: "All fields are required", 
                success: false 
            });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).json({ 
                message: "User not found", 
                success: false 
            });
        }

        console.log('✅ User found:', user._id.toString());

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Password incorrect for:', email);
            return res.status(400).json({ 
                message: "Incorrect password", 
                success: false 
            });
        }

        // Check JWT_SECRET
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing JWT_SECRET in .env file");
        }

        // ✅ CREATE TOKEN - Đảm bảo dùng đúng user._id
        const tokenPayload = {
            id: user._id.toString(), // ✅ Convert ObjectId to string
            role: user.role,
            email: user.email // ✅ Thêm email để debug dễ hơn
        };

        console.log('🎫 Creating token with payload:', tokenPayload);

        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        console.log('✅ Token created:', token.substring(0, 20) + '...');

        // ✅ CLEAR OLD COOKIE FIRST (Important!)
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false,
            path: '/'
        });

        // ✅ SET NEW COOKIE
        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1 day
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false,
            path: '/'
        });

        console.log('✅ Cookie set for user:', user._id.toString());

        // Don't send password to client
        const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({ 
            message: "Login successful", 
            success: true, 
            user: userResponse 
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error.message);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false, 
            error: error.message 
        });
    }
};

// Logout
export const Logout = async (req, res) => {
    try {
        console.log('👋 Logging out user');
        
        res.clearCookie("token", {
            httpOnly: true,
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false,
            path: '/'
        });
        
        return res.status(200).json({ 
            message: "Logout successful", 
            success: true 
        });
    } catch (error) {
        console.error("LOGOUT ERROR:", error);
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false 
        });
    }
};

// Get Profile
export const GetProfile = async (req, res) => {
    try {
        console.log('👤 Getting profile for user ID:', req.user.id);
        
        // Find user without password
        const user = await User.findById(req.user.id).select("-password");
        
        if (!user) {
            console.log('❌ User not found in DB:', req.user.id);
            return res.status(404).json({ 
                message: "User not found", 
                success: false 
            });
        }

        console.log('✅ Profile found:', user.email);

        return res.status(200).json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error("GET PROFILE ERROR:", error);
        return res.status(500).json({ 
            message: "Server error", 
            success: false 
        });
    }
};