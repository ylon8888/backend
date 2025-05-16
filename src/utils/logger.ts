import { createLogger, format, transports } from "winston";

// Function to format the log output
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.colorize(),
  format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] ${message} ${stack || ""}`;
  })
);

const logger = createLogger({
  level: "info",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: process.env.SERVICE_NAME || "default-service-name" },
  transports: [
    new transports.Console({
      // format: format.combine(
      //   format.colorize(),
      //   format.printf(({ timestamp, level, message, stack }) => {
      //     return `${timestamp} ${level}: ${message} ${stack || ""}`;
      //   })
      // ),
      format: logFormat,
    }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
    new transports.File({ filename: "logs/combined.log" }),
  ],
});

export default logger;
