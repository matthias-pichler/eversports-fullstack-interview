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
