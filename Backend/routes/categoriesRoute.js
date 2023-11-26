const router = require("express").Router();
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl } = require("../controllers/CategoriesControllers");
const {verifyTokenAndAdmin}= require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");


// /api/categories
router.route("/")
.post(verifyTokenAndAdmin,createCategoryCtrl)
.get(getAllCategoriesCtrl);

// /api/categorie/:id
router.route("/:id").delete(validateObjectId,verifyTokenAndAdmin,deleteCategoryCtrl)




module.exports = router;