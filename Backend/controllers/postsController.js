const fs = require ("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {Post, validateCreatePost, validateUpdatePost}= require ("../models/Post");
const {cloudinaryUploadImage, cloudinaryRemoveImage} = require ("../utils/cloudinary");
const {Comment} = require("../models/Comment");

/**---------------------------------------
 * @desc Create New Post
 * @route /api/posts
 * @method POST
 * @access private (only logged user)
 --------------------------------------- */
 module.exports.createPostCtrl = asyncHandler(async(req ,res) => {
    //1. validation for image
    if (!req.file){
        return res.status(400).json({message:"no image provided"});
    }

    //2. validation for data
    const { error} = validateCreatePost(req.body);
    if (error){
        
        return res.status(400).json({message: error.details[0].message});
    }

    //3. Upload photo
    const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    //4.Create new post and save it to Db
    const post = await Post.create({
        title: req.body.title,
        description : req.body.description,
        category : req.body.category,
        user : req.user.id,
        image: {
            url : result.secure_url,
            publicId: result.public_id,

        }
    });
    //5.send response to the client 
    res.status(201).json(post);
    //.Remove image from the server
    fs.unlinkSync(imagePath);
 });

 /**---------------------------------------
 * @desc GET All Posts
 * @route /api/posts
 * @method GET
 * @access public
 --------------------------------------- */
 module.exports.getAllPostsCtrl = asyncHandler(async (req, res) =>{
    const POST_PER_PAGE = 3;
    const { pageNumber, category } = req.query;
    let posts;

    if (pageNumber){
        posts = await Post.find()
        .skip((pageNumber - 1) * POST_PER_PAGE) 
        .limit (POST_PER_PAGE)
        .sort({createdAt: -1})
        .populate("user", ["-password"]);;
    }else if (category) {
        posts = await Post.find ({category})
        .sort({createdAt: -1})
        .populate("user", ["-password"]);
    }else{
        posts = await Post.find().sort({createdAt: -1})
        .populate("user", ["-password"]);
    }
    res.status(200).json(posts);

 });

 /**---------------------------------------
 * @desc GET Single Post
 * @route /api/posts/:id
 * @method GET
 * @access public
 --------------------------------------- */
 module.exports.getSinglePostCtrl = asyncHandler(async (req, res) =>{
    const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");

    if (!post) {
        return res.status(404).json({message : 'Post not found'});
    }
    res.status(200).json(post);

 });

 /**---------------------------------------
 * @desc GET Posts count
 * @route /api/posts/count
 * @method GET
 * @access public
 --------------------------------------- */
 module.exports.getPostCountCtrl = asyncHandler(async (req, res) =>{
    const count = await Post.count();
   
    res.status(200).json(count);

 });

 /**---------------------------------------
 * @desc Delete Post
 * @route /api/posts/:id
 * @method DELETE
 * @access private (only admin or owner of the post)
 --------------------------------------- */
 module.exports.deletePostCtrl = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({message : 'Post not found'});
    }
    
    if (req.user.isAdmin || req.user.id === post.user.toString()){
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);
        
        //Delete all comments that belong to this post 
        await Comment.deleteMany({postId:post._id });

        res.status(200).json({message: "post has been deleted successfully", postId:post_id})
    }else {
        res.status(403).json({message: "access denied, forbidden"});
    }

 });

 /**---------------------------------------
 * @desc Update Post
 * @route /api/posts/:id
 * @method PUT
 * @access private (only owner of the post)
 --------------------------------------- */
 module.exports.updatePostCtrl = asyncHandler(async(req, res) =>{
    //1.validation 
    const {error} = validateUpdatePost(req.body);
    if (error){
        return res.status(400).json({message: error.details[0].message});
    }

    //2.Get the post from DB and check if the post exist
     const post = await Post.findById(req.params.id);
     if (!post) {
        return res.status(404).json({message:"post not found"});
     }

    //3. check if this post belong to logges in user
     if (req.user.id !==post.user.toString()){
        return res.status(403).json({message: "Access denied, you are not allowed"});
     }

    //4.Update to the post 
     const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set : {
            title: req.body.title,
            description: req.body.description,
            category : req.body.category,
        }
     }, {new: true}).populate("user", ["-password"])


    //5. send response to teh client 
     res.status(200).json(updatedPost);

 });

 /**---------------------------------------
 * @desc Update Post image
 * @route /api/posts/upload-image/:id
 * @method PUT
 * @access private (only owner of the post)
 --------------------------------------- */
 module.exports.updatePostImageCtrl = asyncHandler(async(req, res) =>{
    //1.validation 
    if (!req.file){
        return res.status(400).json({message: "no image provided"});
    }

    //2.Get the post from DB and check if the post exist
     const post = await Post.findById(req.params.id);
     if (!post) {
        return res.status(404).json({message:"post not found"});
     }

    //3. check if this post belong to logges in user
     if (req.user.id !==post.user.toString()){
        return res.status(403).json({message: "Access denied, you are not allowed"});
     }

    //4.delete old image
    await cloudinaryRemoveImage(post.image.publicId);

    //5.upload new image
    const imagePath = path.join(__dirname,`../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);

    //6. update the image field in the DB 
    const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
        $set : {
            image : {
                url : result.secure_url,
                publicId : result.public_id,

            },
        },
     },
     {new : true}
    );

     //7. send response to client 
     res.status(200).json(updatedPost);

     //8.Remove image from the server
     fs.unlinkSync(imagePath); 
 });

 /**---------------------------------------
 * @desc Toggle Like
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only logged in user)
 --------------------------------------- */
module.exports.togglelLikeCtrl = asyncHandler(async(req, res) => {
    const loggedInUser = req.user.id;
    const{ id: postId } = req.params;

    let post = await Post.findById(postId);
    if (!post){
        return res.status(404).json({message: "post not found"}); 
    }

    const isPostAlreadyLiked = post.likes.find(
        (user) => user.toString() === loggedInUser);

    if (isPostAlreadyLiked){
            post = await Post.findByIdAndUpdate(
            postId, 
            {
              $pull: { likes : loggedInUser}
            }, 
            {new : true});
    } else {
        post = await Post.findByIdAndUpdate(
            postId, 
            {
              $push: { likes : loggedInUser}
            }, 
            {new : true})
    };
    res.status(200).json (post); 
}) 
