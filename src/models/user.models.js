import mongoose, {Schema} from mongoose;
import jwt from "jsonwebtoken" // ye dono bas decrypting k lye use hua hai taki password ko aur jo bhi tokens hai usko decrypt kiya jaye
import bcrypt from "bcrypt"
const userSchema = new Schema({
  username: {
    type: String,
    required:true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true // index true ka matlab agar isko searching mai bahut jyada use karenge to index lagayenge lekin sab m nahi lagayenge
  },
  email: {
    type: String,
    required:true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullname: {
    type: String,
    required:true,
    trim: true,
    index: true
  },
  avatar: {
    type: String,   // cloudinary url
    required:true,
  },
  coverImage: {
    type: String,
  },
  watchHistory: [
    {
      type: Schema.Types.objectId,
      ref: "video"
    }
  ],
  password: {
    type: String,
    required:[true, 'password isa required'],
  },
  refreshToken: {
    type: String
  },
}, {timestamps: true})

userSchema.pre("save", async function (next) { 
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})
// data save hone se pehle agar koi encrypt karna hai koi chz ko to ye uske lye hai /// ya  jo bhi kaam karana hai wo likh sakte hao

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}
// methods likhna hoga password k lye
userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullname: this.fullname
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}
export const User = mongoose.model("User", userSchema)