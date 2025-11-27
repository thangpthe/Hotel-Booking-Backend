// import jwt from "jsonwebtoken";

// export const isAuthenticated = async (req, res, next) => {
//     try {
//         // console.log('🔐 === AUTHENTICATION CHECK ===');
//         // console.log('🍪 Cookies:', Object.keys(req.cookies));
//         // console.log('🔑 Authorization header:', req.headers.authorization ? 'Present' : 'None');
//         let token = req.cookies.token;
        
//         if (!token && req.headers.authorization) {
//             const authHeader = req.headers.authorization;
//             if (authHeader.startsWith('Bearer ')) {
//                 token = authHeader.substring(7); 
//                 console.log('✅ Using token from Authorization header');
//             }
//         } else if (token) {
//             console.log('Using token from cookie');
//         }
        
//         if (!token) {
//             console.log('No token found in cookie or header');
//             return res.status(401).json({ 
//                 message: "Authentication required. Please login.", 
//                 success: false 
//             });
//         }

//         // Verify token
//         const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
//         console.log('Token verified for user:', {
//             id: decoded.id,
//             role: decoded.role,
//             email: decoded.email
//         });
        
//         req.user = decoded;
//         next();
//     } catch (error) {
//         console.error('Auth error:', error.name, '-', error.message);
        
//         if (error.name === 'TokenExpiredError') {
//             return res.status(401).json({ 
//                 message: "Session expired. Please login again.", 
//                 success: false 
//             });
//         }
        
//         if (error.name === 'JsonWebTokenError') {
//             return res.status(401).json({ 
//                 message: "Invalid token. Please login again.", 
//                 success: false 
//             });
//         }
        
//         return res.status(401).json({ 
//             message: "Authentication failed", 
//             success: false 
//         });
//     }
// };

import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        let token;

        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
            console.log(' Using token from Authorization Header');
        }
        
       
        else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
            console.log('Using token from Cookie');
        }

    
        if (!token) {
            return res.status(401).json({ 
                message: "Authentication required. No token provided.", 
                success: false 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();

    } catch (error) {
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Session expired. Please login again.", 
                success: false 
            });
        }
        
        return res.status(401).json({ 
            message: "Invalid token. Authentication failed.", 
            success: false 
        });
    }
};