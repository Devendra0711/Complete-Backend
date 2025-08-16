import mongoose, {Schema} from mongoose;
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"; // ye aggregation pipeline likhne k lye kiya gaya hai
const videoSchema = new Schema({
  videoFile: {
    type: String,  // cloudinary url
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  duration: {
    type: Number,  // cloudinary 
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean, 
    default: true
  },
  owner: {
    type: Schema.Types.objectId,
    ref: "User"
  }
},{timestamps: true})

videoSchema.plugin(mongooseAggregatePaginate)
export const Video = mongoose.model("Video", videoSchema)