import type { IMembership, Membership } from "../entities/membership";
import type { IMembershipPeriod } from "../entities/membership-period";

export type CreateMembershipPeriodInput = Omit<IMembershipPeriod, "id" | "membership">;
export interface CreateMembershipInput extends Omit<IMembership, "id" | "periods"> {
	periods: CreateMembershipPeriodInput[];
}

export interface IMembershipRepository {
	createMembership(input: CreateMembershipInput): Promise<Membership>;

	listMemberships(): Promise<Membership[]>;
}
