import express, { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import membershipPeriods from "../../data/membership-periods.json";
import memberships from "../../data/memberships.json";
import { JsonMembershipRepository } from "../domain/memberships/repositories/json-membership-repository";
import type { IMembershipRepository } from "../domain/memberships/repositories/membership-repository";
import { ListMemberships } from "../domain/memberships/usecases/list-memberships";

const router = express.Router();

const membershipRepository: IMembershipRepository =
	new JsonMembershipRepository({
		memberships: memberships,
		membershipPeriods: membershipPeriods,
	});

router.get("/", async (req: Request, res: Response) => {
	const useCase = new ListMemberships(membershipRepository);

	const memberships = await useCase.execute();

	const result = memberships.map(({ periods, ...membership }) => ({
		membership,
		periods,
	}));

	res.status(StatusCodes.OK).json(result);
});

router.post("/", (req: Request, res: Response) => {
	throw new Error("not implemented");
});

export default router;
