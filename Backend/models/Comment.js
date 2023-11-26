const mongoose = require("mongoose");
const Joi = require('joi');

//comment schema 
const commentSchema = new mongoose.Schema({
    postId: {
        type: mongoose.Types.ObjectId,
        ref: "post",
        required:true,
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required:true,
    },
    Text:{
    type: String,
    required: true,
    },
    username:{
        type: String,
        required: true,
        },

},{
    timestamps:true,
});

//comment model
const Comment = mongoose.model("Comment", commentSchema);

//validate Create comment
function validateCreateComment(obj){
    const schema = Joi.object({
        postId: Joi.string().required().label("Post ID"),
        Text: Joi.string().trim().required().label("Text"),
    });
    return schema.validate(obj);
}

//validate Update comment
function validateUpdateComment(obj){
    const schema = Joi.object({
        Text: Joi.string().trim().required(),
    });
    return schema.validate(obj);
}

module.exports = {
    Comment,
    validateCreateComment,
    validateUpdateComment,
}