import winston from "winston";
import path from "path";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/error.log"), level: "error" }),
    new winston.transports.File({ filename: path.join(__dirname, "../../logs/combined.log") })
  ]
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

export default logger;