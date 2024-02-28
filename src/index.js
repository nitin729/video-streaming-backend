import dotenv from "dotenv";
import connectDB from "./db/db.js";
import app from "./app.js";

dotenv.config();
const port = process.env.PORT;

connectDB()
  .then(() =>
    app.listen(port || 8000, () => {
      console.log(`Server is running at ${port}`);
    })
  )
  .catch((err) => console.error("MONOGODB connection failed !!", err));

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
