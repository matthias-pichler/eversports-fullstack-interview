import express, { type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ValidationError } from "../errors";
import type { CreateMembership } from "../memberships/usecases/create-membership";
import type { ListMemberships } from "../memberships/usecases/list-memberships";
import {
	CreateMembershipResponse,
	MembershipListEntry,
} from "./membership.view";

const USER_ID = 2000;

export class MembershipRouter {
	public readonly router: express.Router;
	private readonly listMemberships: ListMemberships;
	private readonly createMembership: CreateMembership;

	public constructor(useCases: {
		listMemberships: ListMemberships;
		createMembership: CreateMembership;
	}) {
		this.router = express.Router();
		this.listMemberships = useCases.listMemberships;
		this.createMembership = useCases.createMembership;

		this.router.get("/", async (req: Request, res: Response) => {
			const memberships = await this.listMemberships.execute();

			const result = memberships.map((m) => new MembershipListEntry(m));

			res.status(StatusCodes.OK).json(result);
		});

		this.router.post("/", async (req: Request, res: Response) => {
			try {
				const membership = await this.createMembership.execute({
					...req.body,
					userId: USER_ID,
				});

				const result = new CreateMembershipResponse(membership);

				res.status(StatusCodes.CREATED).json(result);
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
	}
}
