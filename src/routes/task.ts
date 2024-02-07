import express, { Request, Response } from "express";
import verifyToken from "../middleware/auth";
import Task, { taskType } from "../modals/task";
import { userInfo } from "os";

const router = express.Router();

/**
 * @swagger
 *
 * definitions:
 *   Task:
 *     type: object
 *     properties:
 *       name:
 *         type: string
 *         description: The name of the task
 *       description:
 *         type: string
 *         description: The description of the task
 *       completed:
 *         type: boolean
 *         description: The completion status of the task
 *
 * /api/tasks/create:
 *   post:
 *     summary: Create a new task
 *     tags:
 *         - Creation & Operations on tasks
 *     description: Create a new task for the authenticated user
 *     security:
 *       - JWTAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Task'
 *     responses:
 *       201:
 *         description: Successfully created task
 *         schema:
 *           $ref: '#/definitions/Task'
 *       500:
 *         description: Internal Server Error
 *
 * /api/tasks/all:
 *   post:
 *     summary: Get all tasks
 *     tags:
 *         - Creation & Operations on tasks
 *     description: Retrieve all tasks belonging to the authenticated user
 *     security:
 *       - JWTAuth: []
 *     responses:
 *       200:
 *         description: A list of tasks
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/Task'
 *       500:
 *         description: Internal Server Error
 *
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     tags:
 *         - Creation & Operations on tasks
 *     description: Retrieve a task by its ID for the authenticated user
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: ID of the task to retrieve
 *     responses:
 *       200:
 *         description: A task object
 *         schema:
 *           $ref: '#/definitions/Task'
 *       400:
 *         description: No task found
 *       500:
 *         description: Internal Server Error
 *
 * /api/tasks/update/{id}:
 *   patch:
 *     summary: Update task by ID
 *     tags:
 *         - Creation & Operations on tasks
 *     description: Update a task by its ID for the authenticated user
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/definitions/Task'
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         schema:
 *           $ref: '#/definitions/Task'
 *       400:
 *         description: Task not found
 *       500:
 *         description: Internal Server Error
 *
 * /api/tasks/del/{id}:
 *   delete:
 *     summary: Delete task by ID
 *     tags:
 *         - Creation & Operations on tasks
 *     description: Delete a task by its ID for the authenticated user
 *     security:
 *       - JWTAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         type: string
 *         description: ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully
 *       400:
 *         description: Task not found
 *       500:
 *         description: Internal Server Error
 */

router.post("/create", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = new Task({ owner: req.userId, ...req.body });
    await task.save();
    res.status(201).send({ message: "Succesfully created task", task });
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.post("/all", verifyToken, async (req: Request, res: Response) => {
  try {
    const tasks = await Task.find({ owner: req.userId });
    if (!tasks) {
      return res.status(200).send({ message: "No task created" });
    }

    res.send(tasks);
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.findOne({ owner: req.userId, _id: req.params.id });
    if (!task) {
      return res.status(400).send({ message: "No task found" });
    }

    res.send(task);
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
});

// update

router.patch(
  "/update/:id",
  verifyToken,
  async (req: Request, res: Response) => {
    const updates = Object.keys(req.body);
    const allowedUpdates: (keyof taskType)[] = [
      "name",
      "description",
      "completed",
    ];

    // Check if all updates are allowed
    const isValidOperation = updates.every((update) =>
      allowedUpdates.includes(update as keyof taskType)
    );

    if (!isValidOperation) {
      return res.status(400).send({ message: "Invalid modification" });
    }

    try {
      const task = await Task.findOneAndUpdate(
        { _id: req.params.id, owner: req.userId },
        req.body,
        { new: true }
      );

      if (!task) {
        return res.status(404).send({ message: "Task not found" });
      }

      res.status(200).send(task);
    } catch (error) {
      res.status(500).send({ message: "Something went wrong" });
    }
  }
);

// delete

router.delete("/del/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const task = await Task.findByIdAndDelete({ _id: req.params.id });
    if (!task) {
      return res.status(400).send({ message: "No task found to delete " });
    }

    res.send({ message: "succesfully deleted " });
  } catch (e) {
    res.status(500).send({ message: "something went wrong" });
  }
});

export default router;
