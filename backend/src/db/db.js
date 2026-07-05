import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const baseUri = process.env.MONGODB_URL;
    const finalUri = baseUri.replace("/?", `/${DB_NAME}?`);

    const connectionInstance = await mongoose.connect(finalUri);
    console.log(
      `\n MongoDB is conneted !! DB HOST : ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log("MONGODB CONNECTION ERROR", error);
    process.exit(1);
  }
};

export default connectDB;
