import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
	theme: {
		extend: {
			colors: {
				brand: {
					navy: "#28326A",
					gold: "#F8AF2C",
					gray: "#e6e6e6",
				},
			},
			borderRadius: {
				xl2: "1rem",
			},
			boxShadow: {
				card: "0 10px 25px rgba(0,0,0,0.08)",
			},
		},
	},
	content: [
		"./components/**/*.{vue,js,ts}",
		"./layouts/**/*.vue",
		"./pages/**/*.vue",
		"./app.vue",
	],
};
