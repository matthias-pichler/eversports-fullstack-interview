import express from "express";
import membershipPeriods from "./data/membership-periods.json";
import memberships from "./data/memberships.json";
import { errorHandler } from "./error-handler.middleware";
import { JsonMembershipRepository } from "./modern/memberships/repositories/json-membership-repository";
import type { IMembershipRepository } from "./modern/memberships/repositories/membership-repository";
import { CreateMembership } from "./modern/memberships/usecases/create-membership";
import { ListMemberships } from "./modern/memberships/usecases/list-memberships";
import { MembershipRouter } from "./modern/routes/membership.routes";

// because of the javascript module, we need to use require to import the legacy routes
const legacyMembershipRoutes = require("./legacy/routes/membership.routes");

const membershipRepository: IMembershipRepository =
	new JsonMembershipRepository({
		memberships: memberships,
		membershipPeriods: membershipPeriods,
	});

const listMemberships = new ListMemberships(membershipRepository);
const createMembership = new CreateMembership(membershipRepository);

const membershipRouter = new MembershipRouter({
	listMemberships,
	createMembership,
});

const app = express();
const port = 3099;

app.use(express.json());
app.use("/memberships", membershipRouter.router);
app.use("/legacy/memberships", legacyMembershipRoutes);
app.use(errorHandler);

app.listen(port, () => {
	console.log(`Server running on http://localhost:${port}`);
});
