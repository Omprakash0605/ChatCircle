import dotenv from "dotenv";
dotenv.config();
import { createServer } from "node:http";
import { initializeSocket } from "./src/sockets/socket.js";

import app from "./src/app.js"
import connectDB from "./src/config/db.js";

const httpServer = createServer(app);

initializeSocket(httpServer, app);

await connectDB();
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});