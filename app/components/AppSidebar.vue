<script setup lang="ts">
const items = [
	{ to: "/dashboard", label: "Dashboard" },
	{ to: "/evaluate/new", label: "Nueva evaluación" },
];

const route = useRoute();
</script>

<template>
	<aside class="w-64 min-h-screen bg-brand-navy text-white">
		<div class="p-6 border-b border-white/10">
			<div class="text-sm opacity-90">MYT</div>
			<div class="text-xl font-bold">Talent Evaluation</div>
		</div>

		<nav class="p-3 space-y-2">
			<NuxtLink
				v-for="it in items"
				:key="it.to"
				:to="it.to"
				class="block px-4 py-3 rounded-lg transition"
				:class="route.path.startsWith(it.to) ? 'bg-white text-brand-navy' : 'hover:bg-white/10'"
			>
				{{ it.label }}
			</NuxtLink>
		</nav>
	</aside>
</template>
