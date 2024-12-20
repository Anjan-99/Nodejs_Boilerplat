require("dotenv/config.js");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const logger = require("./utils/logger.js");
const morganMiddleware = require("./middlewares/morganMiddleware.js");
const main = require("./routes/main.js");
const customError = require("./utils/customError.js");
const globalErrorHandler = require("./utils/globalErrorhandler.js");
const sequelize = require("sequelize");

// Uncaught Exception Handling
process.on("uncaughtException", (err) => {
  logger.error("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  logger.error(err.name, err.message);
  process.exit(1);
});

// Create an Express app
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply security headers using Helmet
app.use(helmet());

// Log HTTP requests using Winston
app.use((req, res, next) => {
  logger.info(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Log HTTP requests using Morgan middleware
app.use(morganMiddleware);

// Enable CORS
const corsOptions = {
  origin: "http://example.com",
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Use the main router
app.use("/api", main);

// Enable gzip compression
app.use(compression());

// Define a route handler for the GET / endpoint
app.get("/", (req, res, next) => {
  const err = new customError("cannot find route", 404);
  next(err);
  res.send("Hello, World!");
});

// Handle 404 errors
app.use((req, res, next) => {
  const err = new customError(
    `Cannot find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

// Handle global errors
app.use(globalErrorHandler);

// Start the server
const port = process.env.APP_PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});