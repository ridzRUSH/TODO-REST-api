import { verify } from "crypto";
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      userId: string;
    }
  }
}

const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["auth_token"];
  if (!token) {
    return res.status(400).send({ message: "Unothorized token " });
  }
  try {
    const decode = jwt.verify(token, process.env.JWT_SECREAT_KEY as string);
    req.userId = (decode as JwtPayload).userId;
    next();
  } catch (e) {
    res.status(500).send({ message: "Something went wrong" });
  }
};
export default verifyToken;
