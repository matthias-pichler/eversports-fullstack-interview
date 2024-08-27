import {
	type BillingInterval,
	Membership,
	type MembershipState,
	type PaymentMethod,
	type IMembership,
} from "../entities/membership";
import {
	MembershipPeriod,
	type MembershipPeriodState,
	type IMembershipPeriod,
} from "../entities/membership-period";
import type { IMembershipRepository } from "./membership-repository";

/**
 * Deal with JSON files for memberships
 */
// biome-ignore lint/suspicious/noExplicitAny: this allows any object to be used here
type JsonType<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends Date
		? string
		: NonNullable<T[K]> extends string
			? T[K] | string
			: T[K];
};

type JsonMembership = JsonType<Omit<IMembership, "periods">>;
type JsonMembershipPeriod = JsonType<IMembershipPeriod>;

export class JsonMembershipRepository implements IMembershipRepository {
	private readonly memberships: JsonMembership[] = [];
	private readonly membershipPeriods: JsonMembershipPeriod[] = [];
	private nextMembershipId = 1;

	public constructor(files: {
		memberships: JsonMembership[];
		membershipPeriods: JsonMembershipPeriod[];
	}) {
		this.memberships = files.memberships;
		this.membershipPeriods = files.membershipPeriods;
		this.nextMembershipId = this.memberships.length + 1;
	}

	public createMembership = async (
		membership: Omit<IMembership, "id">,
	): Promise<IMembership> => {
		throw new Error("Method not implemented.");
	};

	private joinMembershipPeriods = (membership: IMembership): IMembership => {
		const periods = this.membershipPeriods
			.filter((period) => period.membership === membership.id)
			.map(
				(period) =>
					new MembershipPeriod({
						...period,
						state: period.state as MembershipPeriodState,
						start: new Date(period.start),
						end: new Date(period.end),
					}),
			);

		return new Membership({
			...membership,
			periods,
		});
	};

	public listMemberships = async (): Promise<IMembership[]> => {
		const memberships = this.memberships
			.map((membership) => {
				return new Membership({
					...membership,
					billingInterval: membership.billingInterval as BillingInterval,
					state: membership.state as MembershipState,
					paymentMethod: membership.paymentMethod as PaymentMethod | null,
					validFrom: new Date(membership.validFrom),
					validUntil: new Date(membership.validUntil),
					periods: [],
				});
			})
			.map(this.joinMembershipPeriods);

		return memberships;
	};
}
