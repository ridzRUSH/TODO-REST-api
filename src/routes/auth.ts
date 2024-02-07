import express, { Request, Response } from "express";
import User from "../modals/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import verifyToken from "../middleware/auth";

const router = express.Router();

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: User login
 *     tags:
 *         - Authentication & Login
 *     description: API endpoint for user login.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 token:
 *                   type: string
 *                   description: JSON Web Token (JWT) for authentication.
 *       400:
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

router.post("/login", async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const isMatching = await bcrypt.compare(req.body.password, user.password);
    if (!isMatching) {
      return res.status(400).send({ message: "Invalid credentials" });
    }
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECREAT_KEY as string,
      { expiresIn: "1d" }
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400000,
    });

    res.status(200).send({ user, token });
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

/**
 * @swagger
 * /api/users/validate-token:
 *   get:
 *     summary: Validate JWT token
 *     tags:
 *         - Authentication & Login
 *     description: API endpoint to validate the provided JWT token.
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Token is valid.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                   description: ID of the user extracted from the token.
 *       401:
 *         description: Unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */

router.get("/validate-token", verifyToken, async (req, res) => {
  res.status(200).send({ userId: req.userId });
});

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: User logout
 *     tags:
 *         - Authentication & Login
 *     description: API endpoint for user logout.
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: Logout successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 *       500:
 *         description: Server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */

router.post("/logout", verifyToken, async (req: Request, res: Response) => {
  try {
    res.cookie("auth_token", "", { expires: new Date(0) });
    res.send({ message: "Logout successful" });
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

export default router;
