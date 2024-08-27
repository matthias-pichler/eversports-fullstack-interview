import { formatISO } from "date-fns";
import type { IMembership } from "../memberships/entities/membership";
import type { IMembershipPeriod } from "../memberships/entities/membership-period";

export class MembershipPeriodListEntry {
	private readonly period: IMembershipPeriod;

	public constructor(period: IMembershipPeriod) {
		this.period = period;
	}

	public toJSON() {
		return {
			...this.period,
			start: formatISO(this.period.start, { representation: "date" }),
			end: formatISO(this.period.end, { representation: "date" }),
		};
	}
}

export class MembershipListEntry {
	private readonly membership: IMembership;

	public constructor(membership: IMembership) {
		this.membership = membership;
	}

	public toJSON() {
		const { periods, ...membership } = this.membership;

		return {
			membership: {
				...membership,
				validFrom: formatISO(membership.validFrom, { representation: "date" }),
				validUntil: formatISO(membership.validUntil, {
					representation: "date",
				}),
			},
			periods: periods.map((period) =>
				new MembershipPeriodListEntry(period).toJSON(),
			),
		};
	}
}

export class CreateMembershipResponse {
	private readonly membership: IMembership;

	public constructor(membership: IMembership) {
		this.membership = membership;
	}

	public toJSON() {
		const { periods, membership } = new MembershipListEntry(
			this.membership,
		).toJSON();

		return {
			membership,
			membershipPeriods: periods,
		};
	}
}
