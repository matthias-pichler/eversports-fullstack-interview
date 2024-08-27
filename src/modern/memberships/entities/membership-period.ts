export type MembershipPeriodState = "issued" | "planned";

export interface IMembershipPeriod {
	id: number; // db identifier of the period, undocumented
	uuid: string; // unique identifier of the period, undocumented

	membership: number; // membership the period is attached to
	start: Date; // indicates the start of the period
	end: Date; // indicates the end of the period
	state: MembershipPeriodState;
}

export class MembershipPeriod implements IMembershipPeriod {
	public id: number;
	public uuid: string;
	public membership: number;
	public start: Date;
	public end: Date;
	public state: MembershipPeriodState;

	public constructor(data: IMembershipPeriod) {
		this.id = data.id;
		this.uuid = data.uuid;
		this.membership = data.membership;
		this.start = data.start;
		this.end = data.end;
		this.state = data.state;
	}
}
