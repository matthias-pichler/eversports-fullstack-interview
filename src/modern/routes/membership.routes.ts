import express, { type Request, type Response } from "express";
import membershipPeriods from "../../data/membership-periods.json";
import memberships from "../../data/memberships.json";

const router = express.Router();

router.get("/", (req: Request, res: Response) => {
	throw new Error("not implemented");
});

router.post("/", (req: Request, res: Response) => {
	throw new Error("not implemented");
});

export default router;
