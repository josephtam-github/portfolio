import type { Project } from './types';

// Add a screenshot to `public/static/images/project/` and point `src` at it.
// The placeholder SVGs there can be replaced with real screenshots (.webp/.png).
export const projects: Project[] = [
	{
		title: 'LeeWay',
		src: 'leeway.svg',
		color: '#dbeafe',
		url: 'https://github.com/josephtam-github/LeeWay',
		role: 'Mobile Developer',
	},
	{
		title: 'FastBlog',
		src: 'fastblog.svg',
		color: '#ddd6fe',
		url: 'https://github.com/josephtam-github/FastBlog',
		role: 'Back-end Developer',
	},
	{
		title: 'LearnSphere',
		src: 'learnsphere.svg',
		color: '#fae8ff',
		url: 'https://github.com/josephtam-github/LearnSphere',
		role: 'Back-end Developer',
	},
	{
		title: 'SnapVision',
		src: 'snapvision.svg',
		color: '#fee2e2',
		url: 'https://github.com/josephtam-github/SnapVision',
		role: 'Fullstack Developer',
	},
	{
		title: 'Apinote',
		src: 'apinote.svg',
		color: '#ffedd5',
		url: 'https://apinote.vercel.app',
		role: 'Back-end Developer',
	},
	{
		title: 'Django Dojo',
		src: 'django-dojo.svg',
		color: '#ecfccb',
		url: 'https://github.com/josephtam-github/Django-Dojo',
		role: 'Back-end Developer',
	},
];
