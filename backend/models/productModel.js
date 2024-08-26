const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please Enter the product Name"],
        maxLength:[30,"cannot exceed 30 characters"],
        trim:true
    },
    description:{
        type:String,
        // required:[true,"Please Enter the product Description"],
        maxLength:[300,"cannot exceed 300 characters"]
    },
    price:{
        type:Number,
        // required:[true,"Please Enter the product Price"],
        maxLength:[8,"cannot exceed 8 characters"]
    },
    rating:{
        type:Number,
        default:0
    },
    images:[
        {
        public_id:{
            type:String,
            // required:true
        },
        url:{
            type:String,
            // required:true
        }
    }
    ],
    category:{
        type:String,
        // required:[true,"Please Enter the product Category"]
    },
    Stock:{
        type:Number,
        // required:[true,"Please Enter product Stock"],
        maxLength:[4,"cannot exceed 4 characters"],
        default:1
    },
    numOfReviews:{
        type:String,
        default:0
    },
    reviews: [
        {
          user: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            // required: true,
          },
          name: {
            type: String,
            // required: true,
          },
          rating: {
            type: Number,
            // required: true,
          },
          comment: {
            type: String,
            // required: true,
          },
        },
      ],
    
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    
    
});

module.exports = mongoose.model("Product",productSchema);