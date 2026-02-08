import { sessionClear } from "../../utils/session";

export default defineEventHandler(async (event) => {
	sessionClear(event);
	return { ok: true };
});