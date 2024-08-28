import { Membership } from "../memberships/entities/membership";
import { MembershipPeriod } from "../memberships/entities/membership-period";
import {
	CreateMembershipResponse,
	MembershipListEntry,
	MembershipPeriodListEntry,
} from "./membership.view";

describe(CreateMembershipResponse, () => {
	it("represents dates as ISO date strings", () => {
		const membership = new Membership({
			assignedBy: "admin",
			billingInterval: "yearly",
			billingPeriods: 3,
			id: 1,
			name: "Gold",
			paymentMethod: "credit card",
			periods: [],
			recurringPrice: 100,
			state: "active",
			userId: 2000,
			uuid: "5117e4c4-0780-4b0e-aeb7-bfb15b514c2d",
			validFrom: new Date("2021-01-01"),
			validUntil: new Date("2024-01-01"),
		});

		const response = new CreateMembershipResponse(membership).toJSON();

		expect(response.membership).toEqual(
			expect.objectContaining({
				validFrom: "2021-01-01",
				validUntil: "2024-01-01",
			}),
		);
	});

	it("separates periods into membershipPeriods", () => {
		const membership = new Membership({
			assignedBy: "admin",
			billingInterval: "yearly",
			billingPeriods: 3,
			id: 1,
			name: "Gold",
			paymentMethod: "credit card",
			periods: [
				new MembershipPeriod({
					start: new Date("2021-01-01"),
					end: new Date("2022-01-01"),
					id: 1,
					membership: 1,
					state: "issued",
					uuid: "64507959-cd07-43f3-a929-49c1e0a07705",
				}),
			],
			recurringPrice: 100,
			state: "active",
			userId: 2000,
			uuid: "5117e4c4-0780-4b0e-aeb7-bfb15b514c2d",
			validFrom: new Date("2021-01-01"),
			validUntil: new Date("2024-01-01"),
		});

		const response = new CreateMembershipResponse(membership).toJSON();

		expect(response.membership).not.toHaveProperty("periods");
		expect(response.membershipPeriods).toEqual([
			{
				start: "2021-01-01",
				end: "2022-01-01",
				id: 1,
				membershipId: 1,
				state: "issued",
				uuid: "64507959-cd07-43f3-a929-49c1e0a07705",
			},
		]);
	});
});

describe(MembershipListEntry, () => {
	it("represents dates as ISO date strings", () => {
		const membership = new Membership({
			assignedBy: "admin",
			billingInterval: "yearly",
			billingPeriods: 3,
			id: 1,
			name: "Gold",
			paymentMethod: "credit card",
			periods: [],
			recurringPrice: 100,
			state: "active",
			userId: 2000,
			uuid: "5117e4c4-0780-4b0e-aeb7-bfb15b514c2d",
			validFrom: new Date("2021-01-01"),
			validUntil: new Date("2024-01-01"),
		});

		const response = new MembershipListEntry(membership).toJSON();

		expect(response.membership).toEqual(
			expect.objectContaining({
				validFrom: "2021-01-01",
				validUntil: "2024-01-01",
			}),
		);
	});

	it("separates periods into membershipPeriods", () => {
		const membership = new Membership({
			assignedBy: "admin",
			billingInterval: "yearly",
			billingPeriods: 3,
			id: 1,
			name: "Gold",
			paymentMethod: "credit card",
			periods: [
				new MembershipPeriod({
					start: new Date("2021-01-01"),
					end: new Date("2022-01-01"),
					id: 1,
					membership: 1,
					state: "issued",
					uuid: "64507959-cd07-43f3-a929-49c1e0a07705",
				}),
			],
			recurringPrice: 100,
			state: "active",
			userId: 2000,
			uuid: "5117e4c4-0780-4b0e-aeb7-bfb15b514c2d",
			validFrom: new Date("2021-01-01"),
			validUntil: new Date("2024-01-01"),
		});

		const response = new MembershipListEntry(membership).toJSON();

		expect(response.membership).not.toHaveProperty("periods");
		expect(response.periods).toEqual([
			{
				start: "2021-01-01",
				end: "2022-01-01",
				id: 1,
				membershipId: 1,
				state: "issued",
				uuid: "64507959-cd07-43f3-a929-49c1e0a07705",
			},
		]);
	});
});

describe(MembershipPeriodListEntry, () => {
	it("represents dates as ISO date strings", () => {
		const period = new MembershipPeriod({
			start: new Date("2021-01-01"),
			end: new Date("2022-01-01"),
			id: 1,
			membership: 1,
			state: "issued",
			uuid: "64507959-cd07-43f3-a929-49c1e0a07705",
		});

		const response = new MembershipPeriodListEntry(period).toJSON();

		expect(response).toEqual(
			expect.objectContaining({
				start: "2021-01-01",
				end: "2022-01-01",
			}),
		);
	});
});
