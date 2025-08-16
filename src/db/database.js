import mongoose from 'mongoose';
import { DB_NAME } from '../../JS-Back/src/constants.js';

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    console.log(
      `/nMongoDB Connected... DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.error('MONGODB Connection error', error);
    process.exit(1);
  }
};

export default connectDB;
