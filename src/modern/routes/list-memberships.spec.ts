import express from "express";
import { StatusCodes } from "http-status-codes";
import supertest from "supertest";
import membershipPeriods from "../../data/membership-periods.json";
import memberships from "../../data/memberships.json";
import { JsonMembershipRepository } from "../memberships/repositories/json-membership-repository";
import { CreateMembership } from "../memberships/usecases/create-membership";
import { ListMemberships } from "../memberships/usecases/list-memberships";
import { MembershipRouter } from "./membership.routes";

const membershipRepository = new JsonMembershipRepository({
	memberships: memberships,
	membershipPeriods: membershipPeriods,
});

const listMemberships = new ListMemberships(membershipRepository);
const createMembership = new CreateMembership(membershipRepository);

const membershipRouter = new MembershipRouter({
	listMemberships,
	createMembership,
});

const app = express();
app.use(express.json());
app.use("/", membershipRouter.router);
const request = supertest(app);

describe("list memberships", () => {
	it("returns the test memberships", async () => {
		const response = await request.get("/").expect(StatusCodes.OK);
		expect(response.body).toEqual([
			{
				membership: {
					id: 1,
					uuid: "123e4567-e89b-12d3-a456-426614174000",
					name: "Platinum Plan",
					userId: 2000,
					recurringPrice: 150,
					validFrom: "2023-01-01",
					validUntil: "2023-12-31",
					state: "active",
					paymentMethod: "credit card",
					billingInterval: "monthly",
					billingPeriods: 12,
					assignedBy: "Admin",
				},
				periods: [
					{
						id: 1,
						uuid: "123e4567-e89b-12d3-a456-426614174000",
						membership: 1,
						start: "2023-01-01",
						end: "2023-01-31",
						state: "issued",
					},
				],
			},
			{
				membership: {
					id: 2,
					uuid: "123e4567-e89b-12d3-a456-426614174001",
					name: "Gold Plan",
					userId: 2000,
					recurringPrice: 100,
					validFrom: "2023-02-01",
					validUntil: "2023-12-31",
					state: "active",
					paymentMethod: "cash",
					billingInterval: "monthly",
					billingPeriods: 2,
					assignedBy: "Admin",
				},
				periods: [
					{
						id: 2,
						uuid: "123e4567-e89b-12d3-a456-426614174001",
						membership: 2,
						start: "2023-02-01",
						end: "2023-02-28",
						state: "issued",
					},
				],
			},
			{
				membership: {
					id: 3,
					uuid: "123e4567-e89b-12d3-a456-426614174002",
					name: "Gold Plan",
					userId: 2000,
					recurringPrice: 100,
					validFrom: "2023-02-01",
					validUntil: "2023-12-31",
					state: "active",
					paymentMethod: null,
					billingInterval: "monthly",
					billingPeriods: 6,
					assignedBy: "Admin",
				},
				periods: [
					{
						id: 3,
						uuid: "123e4567-e89b-12d3-a456-426614174002",
						membership: 3,
						start: "2023-03-01",
						end: "2023-03-31",
						state: "issued",
					},
				],
			},
		]);
	});

	it("returns a list of memberships", async () => {
		const response = await request.get("/").expect(StatusCodes.OK);
		expect(response.body).toEqual(expect.any(Array));
	});

	it("contains a membership in every entry", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry).toHaveProperty(
				"membership",
				expect.objectContaining({
					id: expect.any(Number),
					name: expect.any(String),
					state: expect.any(String),
				}),
			);
		}
	});

	it("includes a 'userId' property in every membership", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry).toHaveProperty(
				"membership",
				expect.objectContaining({
					userId: expect.any(Number),
				}),
			);
		}
	});

	it("includes a 'uuid' property in every membership", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry).toHaveProperty(
				"membership",
				expect.objectContaining({
					uuid: expect.any(String),
				}),
			);
		}
	});

	it("includes a 'id' property in every membership", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry).toHaveProperty(
				"membership",
				expect.objectContaining({
					id: expect.any(Number),
				}),
			);
		}
	});

	it("includes a 'assignedBy' property in every membership", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry).toHaveProperty(
				"membership",
				expect.objectContaining({
					assignedBy: expect.any(String),
				}),
			);
		}
	});

	it.failing(
		"includes a 'user' property in every membership according to the README",
		async () => {
			const { body } = await request.get("/").expect(StatusCodes.OK);

			for (const entry of body) {
				expect(entry).toHaveProperty(
					"membership",
					expect.objectContaining({
						user: expect.any(Number),
					}),
				);
			}
		},
	);

	it("should include periods for every membership", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry.periods.length).toBeGreaterThan(0);
		}
	});
});
