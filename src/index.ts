import express, { Request, Response } from "express";
import "dotenv/config";
import mongose from "mongoose";
import cookieParser from "cookie-parser";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import userRoutes from "./routes/user";
import authRoutes from "./routes/auth";
import taskRoutes from "./routes/task";

const app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
let PORT = 7000;
app.use("/api/users", userRoutes);
app.use("/api/users", authRoutes);
app.use("/api/tasks", taskRoutes);

mongose.connect(process.env.MOGODB_CONNECTION_STRING as string);

const options = {
  definition: {
    openapi: "3.0.1",
    info: {
      title: "ToDo REST API 📝",
      version: "1.0.0",
    },
    schemes: ["http", "https"],
    servers: [{ url: "http://localhost:7000/" }],
  },
  apis: [
    `${__dirname}/routes/user.ts`,
    "./dist/routes/user.js",
    `${__dirname}/routes/auth.ts`,
    "./dist/routes/auth.js",
    `${__dirname}/routes/task.ts`,
    "./dist/routes/task.js",
  ],
};
const swaggerSpec = swaggerJSDoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("*", async (req: Request, res: Response) => {
  res.redirect("/api-docs");
});

app.listen(PORT, () => {
  console.log("app is up on " + PORT);
});
