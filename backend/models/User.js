const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
{
    name: String,

    email:{
        type:String,
        unique:true,
        required:true
    },

    password:{
        type:String,
        required:true
    },

    role:{
        type:String,
        enum:["admin","user"],
        default:"user"
    },

    profilePic:{
        type:String,
        default:""
    },

    // NEW
    isActive:{
        type:Boolean,
        default:true
    },

    isVerified:{
        type:Boolean,
        default:false
    },

    verificationToken:{
        type:String,
        default:null
    },

    resetPasswordToken:{
        type:String,
        default:null
    },

    resetPasswordExpire:{
        type:Date,
        default:null
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("User",userSchema);