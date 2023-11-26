const jwt = require("jsonwebtoken");


// middleware verify token
function verifyToken(req,res,next){
    const authToken =req.headers.authorization;
    if (authToken){
        const token = authToken.split(" ")[1];
        try {
            const decodedPayload =jwt.verify(token, process.env.JWT_SECRET);
            req.user =decodedPayload;
            next();
        } catch (error) {
            return res.status(401).json({message:"invalid token, access denied"});
            
        }

    }else{
        return res.status(401).json({message:"no token provided, access denied"});
    }
    
}

//middleware verify Token & admin
function verifyTokenAndAdmin(req, res, next){
    verifyToken(req, res, () =>{
        if(req.user.isAdmin){
            next();
        } else {
            return res.status(403).json({message : "not allowed, only admin"});
        }
    });

}

//middleware verify Token & only user himself
function verifyTokenAndOnlyUser(req, res, next){
    verifyToken(req, res, () =>{
        if(req.user.id === req.params.id){
            next();
        } else {
            return res.status(403).json({message : "not allowed, only user himself"});
        }
    });

}

//middleware verify Token & Authorization
function verifyTokenAndAuthorization(req, res, next){
    verifiyToken(req, res, () =>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next();
        } else {
            return res.status(403).json({message : "not allowed, only user himself or admin"});
        }
    });

}

module.exports ={
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization,

}