<template>
	<div class="min-h-screen bg-brand-gray">
		<div class="flex">
			<AppSidebar class="shrink-0" />
			<div class="flex-1 min-w-0">
				<AppTopbar />
				<main class="p-6">
					<slot />
				</main>
			</div>
		</div>
	</div>
</template>
