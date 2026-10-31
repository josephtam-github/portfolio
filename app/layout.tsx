import Analytics from 'app/components/analytics/analytics';
import ContentRefresh from 'app/components/providers/ContentRefresh';
import LenisProvider from 'app/components/providers/LenisProvider';
import ThemeProvider from 'app/components/providers/ThemeProvider';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import ThemeSwitch from './components/layouts/theme-switch/theme-switch';
import { mukta } from './fonts';
import { siteConfig } from './site-config';
import './tailwind.css';

export const metadata: Metadata = {
	title: {
		template: `%s | ${siteConfig.name}`,
		default: siteConfig.name,
	},
	description: siteConfig.description,
	metadataBase: new URL(siteConfig.url),
};

interface RootLayoutProps {
	children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
	return (
		<html lang='en' suppressHydrationWarning className={mukta.className}>
			<head>
				<link
					rel='icon'
					type='image/svg+xml'
					href='/static/favicons/favicon.svg'
				/>
				<meta name='msapplication-TileColor' content='#000000' />
				<meta name='theme-color' content='#000000' />
			</head>
			<body className='bg-white text-black antialiased dark:bg-black dark:text-white selection:bg-primary-500 selection:text-white'>
				<ThemeProvider
					attribute='class'
					defaultTheme='dark'
					themes={['dark', 'light']}
				>
					<LenisProvider>
						<ThemeSwitch />
						{children}
					</LenisProvider>
					{process.env.NODE_ENV === 'production' && <Analytics />}
					{process.env.NODE_ENV === 'development' && <ContentRefresh />}
				</ThemeProvider>
			</body>
		</html>
	);
}
