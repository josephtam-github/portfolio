import Header from '../components/header';
import PageContainer from '../components/layouts/page-container';
import { Thoughts } from '../components/thoughts';
import { siteConfig } from '../site-config';
import { getPosts } from './utils';

export const metadata = {
	title: 'Thoughts',
	description: `My Thoughts - ${siteConfig.name}`,
};

export default function ThoughtsPage() {
	const posts = getPosts();

	return (
		<PageContainer>
			<Header title='Thoughts' />
			<Thoughts posts={posts} />
		</PageContainer>
	);
}
