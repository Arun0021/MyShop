const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ApiFeatures = require("../utils/apifeatures");

//creating a product --admin
exports.createProduct = catchAsyncErrors(async (req, res, next) => {

  req.body.user = req.user.id
  const product = await Product.create(req.body);

  res.status(201).json({
    success: true,
    product,
  });
});
//get all products
exports.getAllProducts = catchAsyncErrors(async (req, res) => {
  const resultPerPage = 5;
  const productCount = await Product.countDocuments();

  const apiFeature = new ApiFeatures(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage);
  const products = await apiFeature.query;
  res.status(200).json({
    success: true,
    products,
  });
});

//update product --admin
exports.updateProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(500).json({
      success: false,
      message: "Product Not found",
    });
  } else {
    const product2 = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      success: true,
      product2,
    });
  }
});

//delete product --admin
exports.deleteProduct = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(500).json({
      success: false,
      message: "Product not found",
    });
  } else {
    await product.deleteOne({ _id: req.params.id });
    res.status(200).json({
      success: true,
      message: `Product with id=${req.params.id} deleted`,
    });
  }
});
//get product details one product
exports.getProductDetails = catchAsyncErrors(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    // res.status(500).json({
    //     success:false,
    //     message:"Product Not Found",
    // })
    return next(new ErrorHandler("Product Not Found", 404));
  } else {
    res.status(200).json({
      success: true,
      product,
    });
  }
});

//create product review
exports.createProductReview = catchAsyncErrors(async (req,res,next)=>{
  const {rating,comment,productId} = req.body;

  const review = {
    user:req.user._id,
    name:req.user.name,
    rating:Number(rating),
    comment,
  }
  const product = await Product.findById(productId);

  const isReviewed = product.reviews.find(
    (rev)=>rev.user.toString()===req.user._id.toString()
  );
  if(isReviewed){
    product.reviews.forEach((rev)=>{
      if(rev.user.toString()===req.user._id.toString()){
        rev.rating = rating;
        rev.comment = comment;
      }
    })
  }else{
    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }
  let avg = 0;
  product.reviews.forEach((rev)=>{
    avg+=rev.rating;
  })

  product.rating = avg/product.reviews.length;

  await product.save({validateBeforeSave:false});

  res.statusCode(200).json({
    success:true,
  })


})
//get all reviews of a product
exports.getProductReviews = catchAsyncErrors(async (req,res,next)=>{
  const product  = await Product.findById(req.query.id);
  if(!product){
    return next(new ErrorHandler("Product Not found",404));
  }
  res.statusCode(200).json({
    success:true,
    reviews:product.reviews,
  })
})



//delete review
exports.deleteReview = catchAsyncErrors(async (req,res,next)=>{
  const product = await Product.findById(req.query.productId);
  if(!product){
    return next(new ErrorHandler("Product Not found",404));
  }
  const reviews = product.reviews.filter((rev)=> rev._id.toString()!==req.query.id.toString());

  let avg = 0;
  reviews.forEach((rev)=>{
    avg+=rev.rating;
  })

  const rating = avg/reviews.length;

  const numOfReviews = reviews.length;

await Product.findByIdAndUpdate(req.query.productId,{
  rating,numOfReviews,reviews
},{
  new:true,
  runValidators:true,
  useFindAndModify:false,
})


  res.statusCode(200).json({
    success:true,
  })


})