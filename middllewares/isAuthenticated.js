import jwt from "jsonwebtoken";

export const isAuthenticated = (req,res,next) => {
    try{
        const {token} = req.cookies;
        if(!token){
            return res.status(401).json({message:"Unauthorized",succes:false});
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }catch(error){
        return res.status(401).json({message:"Unauthorized",succes:false});
    }
}