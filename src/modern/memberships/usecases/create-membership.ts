import { v4 as uuidv4 } from "uuid";
import { ValidationError } from "../../errors";
import type { IMembership, MembershipState } from "../entities/membership";
import type {
	CreateMembershipPeriodInput,
	IMembershipRepository,
} from "../repositories/membership-repository";

// should validUntil be in the input?
export type CreateMembershipInput = Omit<
	IMembership,
	"id" | "uuid" | "state" | "validUntil" | "periods" | "validFrom"
> &
	Partial<Pick<IMembership, "validFrom">>;

export class CreateMembership {
	private readonly repository: IMembershipRepository;

	public constructor(repository: IMembershipRepository) {
		this.repository = repository;
	}

	private validateMembership = (input: CreateMembershipInput): void => {
		if (!input.name || !input.recurringPrice) {
			throw new ValidationError("missingMandatoryFields");
		}

		if (input.recurringPrice < 0) {
			throw new ValidationError("negativeRecurringPrice");
		}

		if (input.recurringPrice > 100 && input.paymentMethod === "cash") {
			throw new ValidationError("cashPriceBelow100");
		}

		if (input.billingInterval === "monthly") {
			if (input.billingPeriods > 12) {
				throw new ValidationError("billingPeriodsMoreThan12Months");
			}
			if (input.billingPeriods < 6) {
				throw new ValidationError("billingPeriodsLessThan6Months");
			}
		} else if (input.billingInterval === "yearly") {
			if (input.billingPeriods > 10) {
				throw new ValidationError("billingPeriodsMoreThan10Years");
			}
			if (input.billingPeriods < 3) {
				throw new ValidationError("billingPeriodsLessThan3Years");
			}
		} else if (input.billingInterval === "weekly") {
			// no validation added because unclear
		} else {
			throw new ValidationError("invalidBillingPeriods");
		}
	};

	private calculateValidUntil = (
		input: Pick<
			IMembership,
			"validFrom" | "billingInterval" | "billingPeriods"
		>,
	): Date => {
		// I would have done this using date-fns but it behaves differently
		const validUntil = new Date(input.validFrom);
		if (input.billingInterval === "monthly") {
			validUntil.setMonth(input.validFrom.getMonth() + input.billingPeriods);
		} else if (input.billingInterval === "yearly") {
			validUntil.setMonth(
				input.validFrom.getMonth() + input.billingPeriods * 12,
			);
		} else if (input.billingInterval === "weekly") {
			validUntil.setDate(input.validFrom.getDate() + input.billingPeriods * 7);
		}

		return validUntil;
	};

	private generatePeriods = (
		input: Pick<
			IMembership,
			"validFrom" | "billingInterval" | "billingPeriods"
		>,
	): CreateMembershipPeriodInput[] => {
		const periods: CreateMembershipPeriodInput[] = [];
		let periodStart = input.validFrom;

		for (let i = 0; i < input.billingPeriods; i++) {
			const validFrom = periodStart;
			const validUntil = new Date(validFrom);

			if (input.billingInterval === "monthly") {
				validUntil.setMonth(validFrom.getMonth() + 1);
			} else if (input.billingInterval === "yearly") {
				validUntil.setMonth(validFrom.getMonth() + 12);
			} else if (input.billingInterval === "weekly") {
				validUntil.setDate(validFrom.getDate() + 7);
			}

			const period: CreateMembershipPeriodInput = {
				uuid: uuidv4(),
				start: validFrom,
				end: validUntil,
				state: "planned", // periods are always planned?
			};
			periods.push(period);
			periodStart = validUntil;
		}

		return periods;
	};

	private calculateState = (
		validity: Pick<IMembership, "validFrom" | "validUntil">,
	): MembershipState => {
		const now = new Date();

		if (now < validity.validFrom) {
			return "pending";
		}

		if (now > validity.validUntil) {
			return "expired";
		}

		return "active";
	};

	public execute = async (
		input: CreateMembershipInput,
	): Promise<IMembership> => {
		this.validateMembership(input);

		const validFrom = new Date(input.validFrom ?? new Date());
		const validUntil = this.calculateValidUntil({ ...input, validFrom });
		const state = this.calculateState({
			validFrom,
			validUntil,
		});
		const periods = this.generatePeriods({
			...input,
			validFrom,
		});

		const membership = {
			...input,
			uuid: uuidv4(),
			state,
			validFrom,
			validUntil,
			periods,
		};

		return this.repository.createMembership(membership);
	};
}
