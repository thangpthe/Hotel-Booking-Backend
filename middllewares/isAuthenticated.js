import jwt from "jsonwebtoken";

// export const isAuthenticated = (req,res,next) => {
//     try{
//         const {token} = req.cookies;
//         if(!token){
//             return res.status(401).json({message:"Unauthorized",succes:false});
//         }
//         const decoded = jwt.verify(token,process.env.JWT_SECRET);
//         req.user = decoded;
//         next();
//     }catch(error){
//         return res.status(401).json({message:"Unauthorized",succes:false});
//     }
// }

export const isAuthenticated = (req,res,next) => {
    try{
        const {token} = req.cookies;
        
        // Log để kiểm tra xem cookie có đến được server không
        console.log("[Auth Debug] Cookies received:", req.cookies); 

        if(!token){
            console.log("[Auth Debug] No token found in cookies");
            return res.status(401).json({message:"User not authenticated (Token missing)", success:false});
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        console.log("[Auth Debug] Token verification failed:", error.message);
        return res.status(401).json({message:"Invalid token", success:false});
    }
}