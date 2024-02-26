import dotenv from "dotenv";
import connectDB from "./db/db.js";
dotenv.config();

connectDB();

/*
 first approach


const app = express();

async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", () => {
      console.log("ERRR: ", error);
      throw err;
    });
    app.listen(process.env.PORT, () => {
      console.log(`App is listening on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error(error);
    throw err;
  }
}; */
