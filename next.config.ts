import type { NextConfig } from 'next';

const umami_url = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_URL ?? '';

const nextConfig: NextConfig = {
	reactStrictMode: true,
	// Next 16 blocks dev scripts/HMR for any origin other than localhost, which
	// stops React from hydrating (no animation, dead theme toggle) when the site
	// is opened via 127.0.0.1, a LAN IP or an IDE preview.
	allowedDevOrigins: [
		'127.0.0.1',
		'*.local',
		'10.*.*.*',
		'172.*.*.*',
		'192.168.*.*',
	],
	pageExtensions: ['ts', 'tsx'],
	transpilePackages: ['next-mdx-remote'],
	reactCompiler: true,
	experimental: {
		turbopackFileSystemCacheForDev: true,
	},
	async rewrites() {
		return [
			{
				source: '/umami.js',
				destination: `${umami_url}/script.js`,
			},
			{
				source: '/api/send',
				destination: `${umami_url}/api/send`,
			},
		];
	},
};

export default nextConfig;
