import dotenv from "dotenv";
import connectDB from "./config/db.js";
import createServerApp from "./createServerApp.js";

dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
const app = createServerApp();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
