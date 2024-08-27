import type { IMembership } from "../entities/membership";
import type { IMembershipRepository } from "../repositories/membership-repository";

// test for this use case could be added if needed

export class ListMemberships {
	private readonly repository: IMembershipRepository;

	public constructor(repository: IMembershipRepository) {
		this.repository = repository;
	}

	public execute = async (): Promise<IMembership[]> => {
		return this.repository.listMemberships();
	};
}
