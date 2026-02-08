export default defineNuxtRouteMiddleware(async (to) => {
	const auth = useAuthStore();

	if (!auth.ready) await auth.me();

	// allow /login always
	if (to.path === "/login") {
		if (auth.loggedIn) return navigateTo("/dashboard");
		return;
	}

	// protect everything else (dashboard, evaluate, etc.)
	if (!auth.loggedIn) return navigateTo("/login");
});
