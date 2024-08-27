import type { IMembership, MembershipState } from "../entities/membership";
import type { CreateMembershipPeriodInput, IMembershipRepository } from "../repositories/membership-repository";
import { v4 as uuidv4 } from 'uuid';
import * as dfns from "date-fns";
import { ValidationError } from "../../../errors";

// should validUntil be in the input?
export type CreateMembershipInput = Omit<
	IMembership,
	"id" | "uuid" | "state" | "validUntil" | "periods"
>;

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
		switch (input.billingInterval) {
			case "weekly":
				return dfns.addWeeks(input.validFrom, input.billingPeriods);
			case "monthly":
				return dfns.addMonths(input.validFrom, input.billingPeriods);
			case "yearly":
				return dfns.addYears(input.validFrom, input.billingPeriods);
			default:
				// same as legacy code
				return input.validFrom;
		}
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
			let validUntil = new Date(validFrom);

			if (input.billingInterval === "monthly") {
				validUntil = dfns.addMonths(validFrom, 1);
			} else if (input.billingInterval === "yearly") {
				validUntil = dfns.addYears(validFrom, 1);
			} else if (input.billingInterval === "weekly") {
				validUntil = dfns.addWeeks(validFrom, 1);
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

		if (dfns.isBefore(now, validity.validFrom)) {
			return "pending";
		}

		if (dfns.isAfter(now, validity.validUntil)) {
			return "expired";
		}

		return "active";
	};

	public execute = async (
		input: CreateMembershipInput,
	): Promise<IMembership> => {
		this.validateMembership(input);

		const validFrom = input.validFrom ?? new Date();
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
