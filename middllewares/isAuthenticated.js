// import jwt from "jsonwebtoken";

// // export const isAuthenticated = (req,res,next) => {
// //     try{
// //         const {token} = req.cookies;
// //         if(!token){
// //             return res.status(401).json({message:"Unauthorized",succes:false});
// //         }
// //         const decoded = jwt.verify(token,process.env.JWT_SECRET);
// //         req.user = decoded;
// //         next();
// //     }catch(error){
// //         return res.status(401).json({message:"Unauthorized",succes:false});
// //     }
// // }

// export const isAuthenticated = (req,res,next) => {
//     try{
//         const {token} = req.cookies;
//         console.log("[Auth Debug] Cookies received:", req.cookies); 

//         if(!token){
//             console.log("[Auth Debug] No token found in cookies");
//             return res.status(401).json({message:"User not authenticated (Token missing)", success:false});
//         }

//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     }catch(error){
//         console.log("[Auth Debug] Token verification failed:", error.message);
//         return res.status(401).json({message:"Invalid token", success:false});
//     }
// }

import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        console.log('🔐 === AUTHENTICATION CHECK ===');
        console.log('🍪 Cookies received:', Object.keys(req.cookies));
        console.log('🍪 Token exists:', !!req.cookies.token);
        
        const token = req.cookies.token;
        
        if (!token) {
            console.log('❌ No token found');
            return res.status(401).json({ 
                message: "Authentication required", 
                success: false 
            });
        }

        // ✅ DECODE TOKEN để xem payload
        console.log('🎫 Token preview:', token.substring(0, 30) + '...');
        
        // Verify and decode
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('✅ Token decoded:', {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        });
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Auth error:', error.name, error.message);
        return res.status(401).json({ 
            message: "Invalid or expired token", 
            success: false 
        });
    }
};