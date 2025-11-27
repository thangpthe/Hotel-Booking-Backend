import jwt from "jsonwebtoken";

export const isAuthenticated = async (req, res, next) => {
    try {
        console.log('🔐 === AUTHENTICATION CHECK ===');
        console.log('🍪 Cookies:', Object.keys(req.cookies));
        console.log('🔑 Authorization header:', req.headers.authorization ? 'Present' : 'None');
        
        // Try to get token from cookie first
        let token = req.cookies.token;
        
        // If no cookie, try Authorization header
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7); // Remove 'Bearer ' prefix
                console.log('✅ Using token from Authorization header');
            }
        } else if (token) {
            console.log('✅ Using token from cookie');
        }
        
        if (!token) {
            console.log('❌ No token found in cookie or header');
            return res.status(401).json({ 
                message: "Authentication required. Please login.", 
                success: false 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        console.log('✅ Token verified for user:', {
            id: decoded.id,
            role: decoded.role,
            email: decoded.email
        });
        
        req.user = decoded;
        next();
    } catch (error) {
        console.error('❌ Auth error:', error.name, '-', error.message);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: "Session expired. Please login again.", 
                success: false 
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: "Invalid token. Please login again.", 
                success: false 
            });
        }
        
        return res.status(401).json({ 
            message: "Authentication failed", 
            success: false 
        });
    }
};