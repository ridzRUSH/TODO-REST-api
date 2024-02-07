import express, { Request, Response } from "express";
import User from "../modals/user";

const router = express.Router();

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: User registration
 *     tags:
 *         - Register
 *     description: API endpoint to create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully.
 *       400:
 *         description: User already exists.
 *       500:
 *         description: Server error.
 */

router.post("/register", async (req: Request, res: Response) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send({ message: "User already exists " });
    }
    user = new User(req.body);
    await user.save();
    res.status(201).send({ message: "Susscesfully created" });
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

export default router;
