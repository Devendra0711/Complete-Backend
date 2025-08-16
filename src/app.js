import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
const app = express()

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  Credentials: true
}))

app.use(express.json({ limit: "16kb"})) // json m data aayega uske liye hai aur kitna ka data le skte hai wo hai 16kb
app.use(express.urlencoded({extended: true, limit: "16kb"})) // ye url k lye hai jo bhi naam hai usme jo bhi encodation hoga uske lye
app.use(express.static("public")) // koi bhi files folder hai to usko stoire karne k lye db m aur "public" yahan naam hai us folder ka
app.use(cookieParser())

//routes import
import userRouter from './routes/user.routes.js'


//routes declaration
app.use("/api/v1/users", userRouter)


// http://localhost:8000/api/v1/users/register


const { app }