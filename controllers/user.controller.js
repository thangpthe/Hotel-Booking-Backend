import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const isProduction = process.env.NODE_ENV === "production";

//SignUp

export const SignUp = async (req,res) =>{
    try{
        const {name,email,password,role}= req.body;
        if(!name || !email || !password || !role){
            return res.json({message:"All fields are required",success:false});
        }

        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.json({message:"User exists",success:false});
        }

        const hashPassword = await bcrypt.hash(password,10);
        const newUser = new User({
            name,
            email,
            password: hashPassword,
            role,
        })
        await newUser.save();
        return res.status(201).json({ message: "Account created successfully", success: true });
    }catch(e){
        console.error(e);
        return res.status(500).json({ message: "Internal server error", success: false });
    }
}
    

//Login


// export const Login = async (req,res) => {

//     try{
//         const {email,password} = req.body;
//         if( !email || !password ){
//             return res.json({message:"All fields are required",success:false});
//         }

//         const user=await User.findOne({email});
//         if(!user){
//             return res.json({message:"User not found",success:false});
//         }

//         const isMatch = await bcrypt.compare(password,user.password);
//         if(!user){
//             return res.json({message:"Email or password invalid",success:false});
//         }

//         const token = jwt.sign({id: user._id,role:user.role},process.env.JWT_SECRET,{
//             expiresIn:"1d",
//         });

//         res.cookie("token",token,{
//             httpOnly:true,
//             maxAge: 24 * 60 * 60 * 1000,
//         });

//         return res.json({message:"Login successful",success:true,user});

//     }catch(e){
//         return res.json({message:"Internal server error",success:false},e);
//     }
// }

export const Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // 1. Validate đầu vào
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required", success: false });
        }

        // 2. Tìm User
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found", success: false });
        }

        // 3. Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.password);
        
        // FIX LOGIC: Phải kiểm tra biến isMatch
        if (!isMatch) { 
            return res.status(400).json({ message: "Incorrect password", success: false });
        }

        // 4. Kiểm tra JWT_SECRET trước khi tạo token (để debug)
        if (!process.env.JWT_SECRET) {
            throw new Error("Missing JWT_SECRET in .env file");
        }

        // 5. Tạo Token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

       res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction ? true : false 
        });

        return res.status(200).json({ message: "Login successful", success: true, user });

    } catch (error) {
        // FIX RESPONSE: Log lỗi ra terminal server để đọc
        console.error("LOGIN ERROR:", error.message); 
        
        // Trả về status 500 thực sự
        return res.status(500).json({ 
            message: "Internal server error", 
            success: false, 
            error: error.message 
        });
    }
}

export const Logout = async (req,res) => {
    try{
        res.clearCookie("token");
        return res.json({message:"Logout successful",success:true});

    }catch(e){
        return res.json({message:"Internal server error",success:false},e);
    }
}