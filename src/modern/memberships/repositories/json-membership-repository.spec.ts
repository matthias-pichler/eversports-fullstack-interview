import { JsonMembershipRepository } from "./json-membership-repository";

// more tests could be added if the repository where more complex

describe(JsonMembershipRepository, () => {
	describe("listMemberships", () => {
		it("joins periods based on membership id", async () => {
			const repository = new JsonMembershipRepository({
				memberships: [
					{
						assignedBy: "admin",
						validFrom: "2021-01-01",
						validUntil: "2022-01-01",
						billingInterval: "yearly",
						billingPeriods: 1,
						id: 1,
						name: "Gold",
						paymentMethod: "credit card",
						recurringPrice: 100,
						state: "active",
						userId: 2000,
						uuid: "dc39941f-470a-42d2-b0c1-ddfc53ec0b37",
					},
				],
				membershipPeriods: [
					{
						id: 1,
						membership: 1,
						start: "2021-01-01",
						end: "2022-01-01",
						uuid: "ee73cad6-f98c-4622-8058-297ef650958a",
						state: "active",
					},
				],
			});

			const memberships = await repository.listMemberships();

			expect(memberships).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						periods: expect.arrayContaining([
							expect.objectContaining({
								id: 1,
								membership: 1,
								start: new Date("2021-01-01"),
								end: new Date("2022-01-01"),
								state: "active",
							}),
						]),
					}),
				]),
			);
		});

		it("returns empty periods if none match", async () => {
			const repository = new JsonMembershipRepository({
				memberships: [
					{
						assignedBy: "admin",
						validFrom: "2021-01-01",
						validUntil: "2022-01-01",
						billingInterval: "yearly",
						billingPeriods: 1,
						id: 1,
						name: "Gold",
						paymentMethod: "credit card",
						recurringPrice: 100,
						state: "active",
						userId: 2000,
						uuid: "dc39941f-470a-42d2-b0c1-ddfc53ec0b37",
					},
				],
				membershipPeriods: [
					{
						id: 1,
						membership: 2,
						start: "2021-01-01",
						end: "2022-01-01",
						uuid: "ee73cad6-f98c-4622-8058-297ef650958a",
						state: "active",
					},
				],
			});

			const memberships = await repository.listMemberships();

			expect(memberships).toEqual(
				expect.arrayContaining([
					expect.objectContaining({
						periods: [],
					}),
				]),
			);
		});
	});

	describe("createMembership", () => {
		it("returns a new membership with an id", async () => {
			const repository = new JsonMembershipRepository({
				memberships: [],
				membershipPeriods: [],
			});

			const membership = await repository.createMembership({
				assignedBy: "admin",
				validFrom: new Date("2021-01-01"),
				validUntil: new Date("2022-01-01"),
				billingInterval: "yearly",
				billingPeriods: 1,
				name: "Gold",
				paymentMethod: "credit card",
				recurringPrice: 100,
				state: "active",
				userId: 2000,
				uuid: "dc39941f-470a-42d2-b0c1-ddfc53ec0b37",
				periods: [],
			});

			expect(membership).toEqual(
				expect.objectContaining({
					id: 1,
					uuid: "dc39941f-470a-42d2-b0c1-ddfc53ec0b37",
				}),
			);
		});
	});
	it("returns newly created memberships in the list", async () => {
		const repository = new JsonMembershipRepository({
			memberships: [],
			membershipPeriods: [],
		});

		const membership = await repository.createMembership({
			assignedBy: "admin",
			validFrom: new Date("2021-01-01"),
			validUntil: new Date("2022-01-01"),
			billingInterval: "yearly",
			billingPeriods: 1,
			name: "Gold",
			paymentMethod: "credit card",
			recurringPrice: 100,
			state: "active",
			userId: 2000,
			uuid: "dc39941f-470a-42d2-b0c1-ddfc53ec0b37",
			periods: [],
		});

		expect(membership).toEqual(
			expect.objectContaining({
				id: 1,
				uuid: "dc39941f-470a-42d2-b0c1-ddfc53ec0b37",
			}),
		);

		const memberships = await repository.listMemberships();

		expect(memberships).toHaveLength(1);
	});
});
