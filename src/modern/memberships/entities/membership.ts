import type { MembershipPeriod } from "./membership-period";

export type MembershipState = "active" | "pending" | "expired";

export type PaymentMethod = "credit card" | "cash";

export type BillingInterval = "weekly" | "monthly" | "yearly";

/**
 * Aggregate root for membership and membership period
 */
export interface IMembership {
	id: number; // db identifier of the membership, undocumented
	uuid: string; // unique identifier of the membership, undocumented

	name: string; // name of the membership
	userId: number; // the user that the membership is assigned to, user in README

	recurringPrice: number; // price the user has to pay for every period
	validFrom: Date; // start of the validity
	validUntil: Date; // end of the validity
	state: MembershipState; // indicates the state of the membership
	paymentMethod: PaymentMethod | null; // which payment method will be used to pay for the periods
	billingInterval: BillingInterval; // the interval unit of the periods
	billingPeriods: number; // the number of periods the membership has

	assignedBy: string; // the user that assigned the membership, undocumented

	periods: MembershipPeriod[]; // periods of the membership
}

export class Membership implements IMembership {
	public readonly id: number;
	public readonly uuid: string;
	public readonly name: string;
	public readonly userId: number;
	public readonly recurringPrice: number;
	public readonly validFrom: Date;
	public readonly validUntil: Date;
	public readonly state: MembershipState;
	public readonly paymentMethod: PaymentMethod | null;
	public readonly billingInterval: BillingInterval;
	public readonly billingPeriods: number;
	public readonly assignedBy: string;
	public readonly periods: MembershipPeriod[];

	public constructor(data: IMembership) {
		this.id = data.id;
		this.uuid = data.uuid;
		this.name = data.name;
		this.userId = data.userId;
		this.recurringPrice = data.recurringPrice;
		this.validFrom = data.validFrom;
		this.validUntil = data.validUntil;
		this.state = data.state;
		this.paymentMethod = data.paymentMethod;
		this.billingInterval = data.billingInterval;
		this.billingPeriods = data.billingPeriods;
		this.assignedBy = data.assignedBy;
		this.periods = data.periods;
	}
}
