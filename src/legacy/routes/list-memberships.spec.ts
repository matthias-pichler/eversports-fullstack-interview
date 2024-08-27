import express from "express";
import { StatusCodes } from "http-status-codes";
import supertest from "supertest";
// because of the javascript module, we need to use require to import the legacy routes
const routes = require("./membership.routes");

const app = express();
app.use(express.json());
app.use("/", routes);
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
					assignedBy: "Admin",
					paymentMethod: "credit card",
					billingInterval: "monthly",
					billingPeriods: 12,
				},
				periods: [],
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
					assignedBy: "Admin",
					paymentMethod: "cash",
					billingInterval: "monthly",
					billingPeriods: 2,
				},
				periods: [],
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
					assignedBy: "Admin",
					paymentMethod: null,
					billingInterval: "monthly",
					billingPeriods: 6,
				},
				periods: [],
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

	it.failing("should include periods for every membership", async () => {
		const { body } = await request.get("/").expect(StatusCodes.OK);

		for (const entry of body) {
			expect(entry.periods.length).toBeGreaterThan(0);
		}
	});
});
