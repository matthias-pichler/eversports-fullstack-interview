import express, { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import membershipPeriods from "../../data/membership-periods.json";
import memberships from "../../data/memberships.json";
import { JsonMembershipRepository } from "../domain/memberships/repositories/json-membership-repository";
import type { IMembershipRepository } from "../domain/memberships/repositories/membership-repository";
import { CreateMembership } from "../domain/memberships/usecases/create-membership";
import { ListMemberships } from "../domain/memberships/usecases/list-memberships";
import { ValidationError } from "../errors";

const USER_ID = 2000;

const router = express.Router();

const membershipRepository: IMembershipRepository =
	new JsonMembershipRepository({
		memberships: memberships,
		membershipPeriods: membershipPeriods,
	});

const listMemberships = new ListMemberships(membershipRepository);
const createMembership = new CreateMembership(membershipRepository);

router.get("/", async (req: Request, res: Response) => {
	const memberships = await listMemberships.execute();

	const result = memberships.map(({ periods, ...membership }) => ({
		membership,
		periods,
	}));

	res.status(StatusCodes.OK).json(result);
});

router.post("/", async (req: Request, res: Response) => {
	try {
		const { periods, ...membership } = await createMembership.execute({
			...req.body,
			userId: USER_ID,
		});

		res
			.status(StatusCodes.CREATED)
			.json({ membership, membershipPeriods: periods });
	} catch (err: unknown) {
		// should ideally be done in error handler middleware, but there is a weird bug with supertest: https://github.com/ladjs/supertest/issues/529
		if (err instanceof ValidationError) {
			return res.status(StatusCodes.BAD_REQUEST).json({
				message: err.message,
			});
		}
		throw err;
	}
});

export default router;
