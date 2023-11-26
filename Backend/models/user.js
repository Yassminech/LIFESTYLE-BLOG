const mongoose = require("mongoose");
const Joi = require("joi");
const jwt = require("jsonwebtoken");

// User schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength: 100,
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
    },
    profilePhoto:{
        type : Object, //Object
        default : {
            url:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
            publicId : null,
        },
    },
    bio: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    isAccountVerified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON:{ virtuals: true},
    toObject: {virtuals:true}
});

//populate posts that belongs to this user when she/he get her/his profile 
userSchema.virtual("posts", {
    ref:"Post",
    foreignField : "user",
    localField:"_id",
});

//generate Auth token
userSchema.methods.generateAuthToken = function (){
    return jwt.sign({id : this._id, isAdmin: this.isAdmin},process.env.JWT_SECRET);

}

// User model
const User = mongoose.model("User", userSchema);

// Validate Register User
function validateRegisterUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

// Validate Login User
function validateLoginUser(obj) {
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);
}

// Validate Update User
function validateUpdateUser(obj) {
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100),
        password: Joi.string().trim().min(8),
        bio : Joi.string(),
    });
    return schema.validate(obj);
}

module.exports = {
    User,
    validateRegisterUser,
    validateLoginUser,
    validateUpdateUser
};