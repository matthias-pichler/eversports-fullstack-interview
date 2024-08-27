import { formatISO } from "date-fns";
import {
	type BillingInterval,
	type IMembership,
	Membership,
	type MembershipState,
	type PaymentMethod,
} from "../entities/membership";
import {
	type IMembershipPeriod,
	MembershipPeriod,
	type MembershipPeriodState,
} from "../entities/membership-period";
import type {
	CreateMembershipInput,
	IMembershipRepository,
} from "./membership-repository";

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

	public constructor(files: {
		memberships: JsonMembership[];
		membershipPeriods: JsonMembershipPeriod[];
	}) {
		this.memberships = files.memberships;
		this.membershipPeriods = files.membershipPeriods;
	}

	public createMembership = async (
		input: CreateMembershipInput,
	): Promise<IMembership> => {
		const membershipId = this.memberships.length + 1;
		const { periods, ...membership } = input;

		const jsonMembership: JsonMembership = {
			...membership,
			id: membershipId,
			validFrom: formatISO(membership.validFrom, { representation: "date" }),
			validUntil: formatISO(membership.validUntil, { representation: "date" }),
		};

		this.memberships.push(jsonMembership);

		const newPeriods: IMembershipPeriod[] = periods.map((period, i) => ({
			...period,
			id: this.membershipPeriods.length + i + 1,
			membership: membershipId,
		}));

		const jsonMembershipPeriods: JsonMembershipPeriod[] = newPeriods.map(
			(period) => ({
				...period,
				start: formatISO(period.start, { representation: "date" }),
				end: formatISO(period.end, { representation: "date" }),
			}),
		);

		this.membershipPeriods.push(...jsonMembershipPeriods);

		return new Membership({
			...input,
			id: membershipId,
			periods: newPeriods,
		});
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
