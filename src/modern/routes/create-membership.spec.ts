import express from "express";
import { StatusCodes } from "http-status-codes";
import supertest from "supertest";
import routes from "./membership.routes";

const app = express();
app.use(express.json());
app.use("/", routes);
const request = supertest(app);

describe("create new membership", () => {
	describe("data validation", () => {
		it("requires a non-empty name", async () => {
			const body = {
				name: "Platinum Plan",
				recurringPrice: 150.0,
				validFrom: "2023-01-01",
				state: "active",
				paymentMethod: "credit card",
				billingInterval: "monthly",
				billingPeriods: 12,
			};

			await request.post("/").send(body).expect(StatusCodes.CREATED);

			await request
				.post("/")
				.send({
					...body,
					name: undefined,
				})
				.expect(StatusCodes.BAD_REQUEST, {
					message: "missingMandatoryFields",
				});

			await request
				.post("/")
				.send({
					...body,
					name: "",
				})
				.expect(StatusCodes.BAD_REQUEST, {
					message: "missingMandatoryFields",
				});
		});

		describe("recurringPrice", () => {
			it("requires a recurringPrice", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						// recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 12,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "missingMandatoryFields",
					});
			});

			it("requires a non-negative recurringPrice", async () => {
				const body = {
					name: "Platinum Plan",
					recurringPrice: 150.0,
					validFrom: "2023-01-01",
					state: "active",
					paymentMethod: "credit card",
					billingInterval: "monthly",
					billingPeriods: 12,
				};

				await request
					.post("/")
					.send({
						...body,
						recurringPrice: -150.0,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "negativeRecurringPrice",
					});

				await request
					.post("/")
					.send({
						...body,
						recurringPrice: 150.0,
					})
					.expect(StatusCodes.CREATED);
			});

			it("allows cash only for recurringPrice <= 100", async () => {
				const body = {
					name: "Platinum Plan",
					recurringPrice: 100.0,
					validFrom: "2023-01-01",
					state: "active",
					paymentMethod: "cash",
					billingInterval: "monthly",
					billingPeriods: 12,
				};

				await request
					.post("/")
					.send({
						...body,
						recurringPrice: 101.0,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "cashPriceBelow100",
					});

				await request
					.post("/")
					.send({
						...body,
						recurringPrice: 100.0,
					})
					.expect(StatusCodes.CREATED);
			});
		});

		describe("billingInterval", () => {
			it("requires a billingInterval", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						// billingInterval: "monthly",
						billingPeriods: 12,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "invalidBillingPeriods",
					});
			});

			it.each(["", null, "invalid", undefined])(
				"rejects an invalid billingInterval",
				async (billingInterval) => {
					await request
						.post("/")
						.send({
							name: "Platinum Plan",
							recurringPrice: 150.0,
							validFrom: "2023-01-01",
							state: "active",
							paymentMethod: "credit card",
							billingInterval,
							billingPeriods: 12,
						})
						.expect(StatusCodes.BAD_REQUEST, {
							message: "invalidBillingPeriods",
						});
				},
			);

			it("allows monthly billing", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 12,
					})
					.expect(StatusCodes.CREATED);
			});

			it("allows yearly billing", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "yearly",
						billingPeriods: 3,
					})
					.expect(StatusCodes.CREATED);
			});

			it("allows weekly billing", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "weekly",
						billingPeriods: 52,
					})
					.expect(StatusCodes.CREATED);
			});
		});

		describe("billingPeriods", () => {
			it.each([6, 8, 9, 11, 12])(
				"allows monthly billing for 6-12 months",
				async (billingPeriods) => {
					await request
						.post("/")
						.send({
							name: "Platinum Plan",
							recurringPrice: 150.0,
							validFrom: "2023-01-01",
							state: "active",
							paymentMethod: "credit card",
							billingInterval: "monthly",
							billingPeriods,
						})
						.expect(StatusCodes.CREATED);
				},
			);

			it("rejects monthly billing shorter than 6 months", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 5,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "billingPeriodsLessThan6Months",
					});
			});

			it("rejects monthly billing longer than 12 months", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 13,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "billingPeriodsMoreThan12Months",
					});
			});

			it.each([3, 4, 5, 9, 10])(
				"allows yearly billing for 3-10 years",
				async (billingPeriods) => {
					await request
						.post("/")
						.send({
							name: "Platinum Plan",
							recurringPrice: 150.0,
							validFrom: "2023-01-01",
							state: "active",
							paymentMethod: "credit card",
							billingInterval: "yearly",
							billingPeriods,
						})
						.expect(StatusCodes.CREATED);
				},
			);

			it("rejects yearly billing shorter than 3 years", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "yearly",
						billingPeriods: 2,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "billingPeriodsLessThan3Years",
					});
			});

			it("rejects yearly billing longer than 10 years", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-01-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "yearly",
						billingPeriods: 11,
					})
					.expect(StatusCodes.BAD_REQUEST, {
						message: "billingPeriodsMoreThan10Years",
					});
			});
		});

		describe("validUntil", () => {
			it("correctly rolls over dates to next year for monthly billing", async () => {
				const body = {
					name: "Platinum Plan",
					recurringPrice: 150.0,
					validFrom: "2023-05-01",
					state: "active",
					paymentMethod: "credit card",
					billingInterval: "monthly",
					billingPeriods: 12,
				};

				await request
					.post("/")
					.send(body)
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membership).toEqual(
							expect.objectContaining({
								validUntil: "2024-05-01",
							}),
						);
					});
			});

			it("correctly rolls over dates to next year for yearly billing", async () => {
				const body = {
					name: "Platinum Plan",
					recurringPrice: 150.0,
					validFrom: "2023-05-01",
					state: "active",
					paymentMethod: "credit card",
					billingInterval: "yearly",
					billingPeriods: 3,
				};

				await request
					.post("/")
					.send(body)
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membership).toEqual(
							expect.objectContaining({
								validUntil: "2026-05-01",
							}),
						);
					});
			});

			it("correctly rolls over dates to next month for weekly billing", async () => {
				const body = {
					name: "Platinum Plan",
					recurringPrice: 150.0,
					validFrom: "2023-05-01",
					state: "active",
					paymentMethod: "credit card",
					billingInterval: "weekly",
					billingPeriods: 5,
				};

				await request
					.post("/")
					.send(body)
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membership).toEqual(
							expect.objectContaining({
								validUntil: "2023-06-05",
							}),
						);
					});
			});
		});

		describe("state", () => {
			it("creates a pending membership if validFrom is in the future", async () => {
				const validFrom = new Date();
				validFrom.setFullYear(validFrom.getFullYear() + 1);

				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: validFrom.toISOString(),
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 12,
					})
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membership).toEqual(
							expect.objectContaining({
								state: "pending",
							}),
						);
					});
			});

			it("creates an expired membership if validUntil is in the past", async () => {
				const validFrom = new Date();
				validFrom.setFullYear(validFrom.getFullYear() - 1);

				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: validFrom.toISOString(),
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 6,
					})
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membership).toEqual(
							expect.objectContaining({
								state: "expired",
							}),
						);
					});
			});

			it("creates an active membership if validFrom < now < validUntil", async () => {
				const validFrom = new Date();
				validFrom.setFullYear(validFrom.getFullYear() - 1);

				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: validFrom.toISOString(),
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "yearly",
						billingPeriods: 3,
					})
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membership).toEqual(
							expect.objectContaining({
								state: "active",
							}),
						);
					});
			});
		});

		describe("membershipPeriods", () => {
			it("creates the same number of membership periods as billingPeriods", async () => {
				await request
					.post("/")
					.send({
						name: "Platinum Plan",
						recurringPrice: 150.0,
						validFrom: "2023-05-01",
						state: "active",
						paymentMethod: "credit card",
						billingInterval: "monthly",
						billingPeriods: 6,
					})
					.expect(StatusCodes.CREATED)
					.expect((res) => {
						expect(res.body.membershipPeriods).toHaveLength(6);
					});
			});
		});
	});
});
