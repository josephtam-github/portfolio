/**
 * Single source of truth for personal details used across the site.
 * Edit the values below to update the hero, metadata, sitemap, stats, etc.
 */
export const siteConfig = {
	name: 'Joseph Tam',
	role: 'Engineer & Designer',
	location: 'Port Harcourt, Nigeria',
	description: 'I am a multi-talented engineer and designer.',

	// Set NEXT_PUBLIC_SITE_URL in production (e.g. https://your-domain.com)
	url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',

	// Leave a value empty ('') to hide that icon / link
	socials: {
		github: 'https://github.com/josephtam-github',
		x: 'https://x.com/realJosephTam',
		linkedin: 'https://www.linkedin.com/in/realjosephtam/',
		email: 'realJosephTam@gmail.com',
	},

	githubUsername: 'josephtam-github',
} as const;
