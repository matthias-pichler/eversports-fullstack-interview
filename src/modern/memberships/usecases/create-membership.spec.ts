import { ValidationError } from "../../errors";
import {
	CreateMembership,
	type CreateMembershipInput,
} from "./create-membership";

describe(CreateMembership, () => {
	beforeAll(() => {
		jest.useFakeTimers({
			now: new Date("2021-05-01"),
		});
	});

	afterAll(() => {
		jest.useRealTimers();
	});

	it("starts the validity from the current date if not provided", async () => {
		const useCase = new CreateMembership({
			createMembership: jest
				.fn()
				.mockImplementation((input) => ({ ...input, id: 1 })),
			listMemberships: jest.fn(),
		});

		const membership = await useCase.execute({
			name: "Platinum Plan",
			recurringPrice: 150,
			paymentMethod: "credit card",
			billingInterval: "monthly",
			billingPeriods: 12,
			assignedBy: "admin",
			userId: 2000,
		});

		expect(membership).toEqual(
			expect.objectContaining({
				validFrom: new Date("2021-05-01"),
			}),
		);
	});

	it("it uses the specified start date", async () => {
		const useCase = new CreateMembership({
			createMembership: jest
				.fn()
				.mockImplementation((input) => ({ ...input, id: 1 })),
			listMemberships: jest.fn(),
		});

		const membership = await useCase.execute({
			name: "Platinum Plan",
			recurringPrice: 150,
			paymentMethod: "credit card",
			billingInterval: "monthly",
			billingPeriods: 12,
			assignedBy: "admin",
			userId: 2000,
			validFrom: new Date("2021-07-01"),
		});

		expect(membership).toEqual(
			expect.objectContaining({
				validFrom: new Date("2021-07-01"),
			}),
		);
	});

	it.each`
		billingInterval | billingPeriods | validUntil
		${"monthly"}    | ${12}          | ${new Date("2022-03-01")}
		${"yearly"}     | ${3}           | ${new Date("2024-03-01")}
		${"yearly"}     | ${10}          | ${new Date("2031-03-01")}
		${"weekly"}     | ${1}           | ${new Date("2021-03-08")}
		${"weekly"}     | ${2}           | ${new Date("2021-03-15")}
	`(
		"calculates the validUntil date based on the billing interval and periods",
		async ({ billingInterval, billingPeriods, validUntil }) => {
			const useCase = new CreateMembership({
				createMembership: jest
					.fn()
					.mockImplementation((input) => ({ ...input, id: 1 })),
				listMemberships: jest.fn(),
			});

			const membership = await useCase.execute({
				name: "Platinum Plan",
				recurringPrice: 150,
				paymentMethod: "credit card",
				billingInterval,
				billingPeriods,
				assignedBy: "admin",
				userId: 2000,
				validFrom: new Date("2021-03-01"),
			});

			expect(membership).toEqual(
				expect.objectContaining({
					validUntil,
				}),
			);
		},
	);

	it.each`
		billingInterval | billingPeriods | validFrom                 | state
		${"monthly"}    | ${12}          | ${new Date("2020-11-12")} | ${"active"}
		${"monthly"}    | ${6}           | ${new Date("2021-05-01")} | ${"active"}
		${"yearly"}     | ${3}           | ${new Date("2018-05-01")} | ${"active"}
		${"monthly"}    | ${6}           | ${new Date("2021-06-01")} | ${"pending"}
		${"yearly"}     | ${3}           | ${new Date("2015-05-01")} | ${"expired"}
	`(
		"infers the state base on the billing interval",
		async ({ billingInterval, billingPeriods, validFrom, state }) => {
			const useCase = new CreateMembership({
				createMembership: jest
					.fn()
					.mockImplementation((input) => ({ ...input, id: 1 })),
				listMemberships: jest.fn(),
			});

			const membership = await useCase.execute({
				name: "Platinum Plan",
				recurringPrice: 150,
				paymentMethod: "credit card",
				billingInterval,
				billingPeriods,
				assignedBy: "admin",
				userId: 2000,
				validFrom,
			});

			expect(membership).toEqual(
				expect.objectContaining({
					state,
				}),
			);
		},
	);

	it("generates the correct number of billing periods", async () => {
		const useCase = new CreateMembership({
			createMembership: jest
				.fn()
				.mockImplementation((input) => ({ ...input, id: 1 })),
			listMemberships: jest.fn(),
		});

		const membership = await useCase.execute({
			name: "Platinum Plan",
			recurringPrice: 150,
			paymentMethod: "credit card",
			billingInterval: "monthly",
			billingPeriods: 7,
			assignedBy: "admin",
			userId: 2000,
			validFrom: new Date("2021-03-01"),
		});

		expect(membership.periods).toHaveLength(7);
	});

	it("sets the start and end date for each period based on the interval", async () => {
		const useCase = new CreateMembership({
			createMembership: jest
				.fn()
				.mockImplementation((input) => ({ ...input, id: 1 })),
			listMemberships: jest.fn(),
		});

		const { periods } = await useCase.execute({
			name: "Platinum Plan",
			recurringPrice: 150,
			paymentMethod: "credit card",
			billingInterval: "yearly",
			billingPeriods: 4,
			assignedBy: "admin",
			userId: 2000,
			validFrom: new Date("2023-01-01"),
		});

		expect(periods).toEqual([
			expect.objectContaining({
				start: new Date("2023-01-01"),
				end: new Date("2024-01-01"),
			}),
			expect.objectContaining({
				start: new Date("2024-01-01"),
				end: new Date("2025-01-01"),
			}),
			expect.objectContaining({
				start: new Date("2025-01-01"),
				end: new Date("2026-01-01"),
			}),
			expect.objectContaining({
				start: new Date("2026-01-01"),
				end: new Date("2027-01-01"),
			}),
		]);
	});

	describe("data validation", () => {
		const input: CreateMembershipInput = {
			name: "Platinum Plan",
			recurringPrice: 150.0,
			validFrom: new Date("2023-01-01"),
			paymentMethod: "credit card",
			billingInterval: "monthly",
			billingPeriods: 12,
			userId: 2000,
			assignedBy: "admin",
		};

		const useCase = new CreateMembership({
			createMembership: jest
				.fn()
				.mockImplementation((input) => ({ ...input, id: 1 })),
			listMemberships: jest.fn(),
		});

		it("allows a valid input", async () => {
			await expect(useCase.execute(input)).resolves.not.toThrow();
		});

		it("requires a non-empty name", async () => {
			await expect(
				useCase.execute({
					...input,
					name: "",
				}),
			).rejects.toThrow(new ValidationError("missingMandatoryFields"));

			await expect(
				useCase.execute({
					...input,
					name: null as any,
				}),
			).rejects.toThrow(new ValidationError("missingMandatoryFields"));

			await expect(
				useCase.execute({
					...input,
					name: undefined as any,
				}),
			).rejects.toThrow(new ValidationError("missingMandatoryFields"));
		});

		describe("recurringPrice", () => {
			it("requires a recurringPrice", async () => {
				await expect(
					useCase.execute({
						...input,
						recurringPrice: undefined as any,
					}),
				).rejects.toThrow(new ValidationError("missingMandatoryFields"));
			});

			it("requires a non-negative recurringPrice", async () => {
				await expect(
					useCase.execute({
						...input,
						recurringPrice: -150.0,
					}),
				).rejects.toThrow(new ValidationError("negativeRecurringPrice"));
			});

			it("allows cash only for recurringPrice <= 100", async () => {
				await expect(
					useCase.execute({
						...input,
						recurringPrice: 101.0,
						paymentMethod: "cash",
					}),
				).rejects.toThrow(new ValidationError("cashPriceBelow100"));

				await expect(
					useCase.execute({
						...input,
						recurringPrice: 100.0,
						paymentMethod: "cash",
					}),
				).resolves.not.toThrow();
			});
		});

		describe("billingInterval", () => {
			it("requires a billingInterval", async () => {
				await expect(
					useCase.execute({
						...input,
						billingInterval: undefined as any,
					}),
				).rejects.toThrow(new ValidationError("invalidBillingPeriods"));
			});

			it.each(["", null, "invalid", undefined])(
				"rejects an invalid billingInterval",
				async (billingInterval: any) => {
					await expect(
						useCase.execute({
							...input,
							billingInterval,
						}),
					).rejects.toThrow(new ValidationError("invalidBillingPeriods"));
				},
			);

			it("allows monthly billing", async () => {
				await expect(
					useCase.execute({
						...input,
						billingInterval: "monthly",
						billingPeriods: 12,
					}),
				).resolves.not.toThrow();
			});

			it("allows yearly billing", async () => {
				await expect(
					useCase.execute({
						...input,
						billingInterval: "yearly",
						billingPeriods: 3,
					}),
				).resolves.not.toThrow();
			});

			it("allows weekly billing", async () => {
				await expect(
					useCase.execute({
						...input,
						billingInterval: "weekly",
						billingPeriods: 52,
					}),
				).resolves.not.toThrow();
			});
		});

		describe("billingPeriods", () => {
			it.each([6, 8, 9, 11, 12])(
				"allows monthly billing for 6-12 months",
				async (billingPeriods) => {
					await expect(
						useCase.execute({
							...input,
							billingPeriods,
						}),
					).resolves.not.toThrow();
				},
			);

			it("rejects monthly billing shorter than 6 months", async () => {
				await expect(
					useCase.execute({
						...input,
						billingPeriods: 5,
					}),
				).rejects.toThrow(new ValidationError("billingPeriodsLessThan6Months"));
			});

			it("rejects monthly billing longer than 12 months", async () => {
				await expect(
					useCase.execute({
						...input,
						billingPeriods: 13,
					}),
				).rejects.toThrow(
					new ValidationError("billingPeriodsMoreThan12Months"),
				);
			});

			it.each([3, 4, 5, 9, 10])(
				"allows yearly billing for 3-10 years",
				async (billingPeriods) => {
					await expect(
						useCase.execute({
							...input,
							billingInterval: "yearly",
							billingPeriods,
						}),
					).resolves.not.toThrow();
				},
			);

			it("rejects yearly billing shorter than 3 years", async () => {
				await expect(
					useCase.execute({
						...input,
						billingInterval: "yearly",
						billingPeriods: 2,
					}),
				).rejects.toThrow(new ValidationError("billingPeriodsLessThan3Years"));
			});

			it("rejects yearly billing longer than 10 years", async () => {
				await expect(
					useCase.execute({
						...input,
						billingInterval: "yearly",
						billingPeriods: 11,
					}),
				).rejects.toThrow(new ValidationError("billingPeriodsMoreThan10Years"));
			});
		});
	});

	describe("validUntil", () => {
		const input: CreateMembershipInput = {
			name: "Platinum Plan",
			recurringPrice: 150.0,
			validFrom: new Date("2023-01-01"),
			paymentMethod: "credit card",
			billingInterval: "monthly",
			billingPeriods: 12,
			userId: 2000,
			assignedBy: "admin",
		};

		const useCase = new CreateMembership({
			createMembership: jest
				.fn()
				.mockImplementation((input) => ({ ...input, id: 1 })),
			listMemberships: jest.fn(),
		});

		it("correctly rolls over dates to next year for monthly billing", async () => {
			await expect(
				useCase.execute({
					...input,
					validFrom: new Date("2023-05-01"),
					billingInterval: "monthly",
					billingPeriods: 12,
				}),
			).resolves.toEqual(
				expect.objectContaining({
					validUntil: new Date("2024-05-01"),
				}),
			);
		});

		it("correctly rolls over dates to next year for yearly billing", async () => {
			await expect(
				useCase.execute({
					...input,
					validFrom: new Date("2023-05-01"),
					billingInterval: "yearly",
					billingPeriods: 3,
				}),
			).resolves.toEqual(
				expect.objectContaining({
					validUntil: new Date("2026-05-01"),
				}),
			);
		});

		it("correctly rolls over dates to next month for weekly billing", async () => {
			await expect(
				useCase.execute({
					...input,
					validFrom: new Date("2023-05-01"),
					billingInterval: "weekly",
					billingPeriods: 5,
				}),
			).resolves.toEqual(
				expect.objectContaining({
					validUntil: new Date("2023-06-05"),
				}),
			);
		});
	});
});
