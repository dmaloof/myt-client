import { getCookie, setCookie, deleteCookie } from "h3"
import { createHmac } from "node:crypto";

type SessionData = {
	clientId: string;
	clientKey: string;
	clientName?: string;
	tokenBalance?: number;
	isActive?: boolean;
	updatedAt?: string;
};

const COOKIE_NAME = "myt_session";

export function sessionSet(event: any, secret: string, data: SessionData) {
	const json = JSON.stringify(data);
	const sig = sign(json, secret);
	const value = Buffer.from(`${json}.${sig}`).toString("base64url");

	setCookie(event, COOKIE_NAME, value, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7,
	});
}

export function sessionGet(event: any, secret: string): SessionData | null {
	const raw = getCookie(event, COOKIE_NAME);
	if (!raw) return null;

	try {
		const decoded = Buffer.from(raw, "base64url").toString("utf8");
		const lastDot = decoded.lastIndexOf(".");
		if (lastDot < 0) return null;

		const json = decoded.slice(0, lastDot);
		const sig = decoded.slice(lastDot + 1);

		if (!timingSafeEq(sig, sign(json, secret))) return null;

		return JSON.parse(json) as SessionData;
	} catch {
		return null;
	}
}

export function sessionClear(event: any) {
	deleteCookie(event, COOKIE_NAME, { path: "/" });
}

function sign(payload: string, secret: string) {
	return createHmac("sha256", secret).update(payload).digest("hex");
}

function timingSafeEq(a: string, b: string) {
	if (a.length !== b.length) return false;
	let out = 0;
	for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
	return out === 0;
}

export type { SessionData };
