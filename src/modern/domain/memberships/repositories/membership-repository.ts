import type { Membership } from "../entities/membership";

export interface IMembershipRepository {
	createMembership(membership: Omit<Membership, "id">): Promise<Membership>;

	listMemberships(): Promise<Membership[]>;
}
