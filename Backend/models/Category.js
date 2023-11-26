const mongoose = require("mongoose");
const Joi = require('joi');

//category schema 
const CategorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: "User",
        required:true,
    },
    Title:{
      type: String,
      required: true,
      trim: true,
    },

},{
    timestamps:true,
});

//category model
const Category = mongoose.model("Category", CategorySchema);

//validate Create Category
function validateCreateCategory(obj){
    const schema = Joi.object({
        Title: Joi.string().trim().required().label("Title"),
    });
    return schema.validate(obj);
}


module.exports = {
   Category,
   validateCreateCategory
}