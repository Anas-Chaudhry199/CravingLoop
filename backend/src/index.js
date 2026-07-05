import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/db.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Express server is crash ", error);
    });
    app.listen(port, () => {
      console.log(`your server is running on port: ${port}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB connect is failed!!! ", error);
  });
