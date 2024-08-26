const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//create new order
exports.newOrder = catchAsyncErrors(async (req,res,next)=>{
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
      } = req.body;

      const order = await Order.create({
        shippingInfo,
    orderItems,
    paymentInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt:Date.now(),
    user:req.user._id,
      })

    res.statusCode(201).json({
        success:true,
        order,
    })


});

//get single order --admin
exports.getSingleOrder = catchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id).populate("user","name email");
    if(!order){
        return next(new ErrorHandler("Order not Found",404));
    }
    res.status(200).json({
        success:true,
        order,
    })
})

//get logged in user's order
exports.myOrders = catchAsyncErrors(async (req,res,next)=>{
    const orders = await Order.findById({user:req.user._id});
    
    res.status(200).json({
        success:true,
        orders,
    })
})

//get all orders --admin
exports.getAllOrders = catchAsyncErrors(async (req,res,next)=>{
    const orders = await Order.find();

    let totalAmount = 0;
    orders.forEach((o)=>{
        totalAmount +=  o.totalPrice;
    })

    res.status(200).json({
        success:true,
        orders,
        totalAmount,
    })

})

//update Order status --admin
exports.updateOrder = catchAsyncErrors(async (req,res,next)=>{
    const order = await Order.findById(req.params.id);
    if(!order){
        return next(new ErrorHandler("Order not found",404));
    }
    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("Order is already delivered!",400));
    }
    order.orderItems.forEach(async (o)=>{
        await updateStock(order.product,o.quantity);
    });
    order.orderStatus = req.body.status;
    if(req.body.status === "Delivered"){
       order.deliveredAt = Date.now();
    } 
    await order.save({validateBeforeSave:false});

    res.status(200).json({
        success:true,
    })

})

async function updateStock(id,quantity){
    const product = await Product.findById(id);

    product.Stock -= quantity;
    await product.save({validateBeforeSave:false});


}

// delete Order -- Admin
exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }
  
    await order.remove();
  
    res.status(200).json({
      success: true,
    });
  });


