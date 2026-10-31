import classNames from 'classnames';
import Link from 'next/link';
import { merryWeather } from '../../fonts';
import { siteConfig } from '../../site-config';
import { AtSignIcon } from '../layouts/icons/at-sign-icon';
import { GithubIcon } from '../layouts/icons/github-icon';
import { LinkedinIcon } from '../layouts/icons/linkedin-icon';
import { XIcon } from '../layouts/icons/x-icon';
import TechCursor from '../tech-cursor';

export default function Hero() {
	const { socials } = siteConfig;

	return (
		<main className='relative min-h-svh w-screen overflow-hidden'>
			<TechCursor containerClassName='min-h-svh w-screen'>
				<div
					className={classNames('relative min-h-svh', merryWeather.className)}
				>
					<div className='absolute top-[20%] md:top-[40%] max-w-5xl flex-col space-y-4 justify-center px-8 md:px-24 lg:ml-14'>
						<h1 className='text-2xl font-medium md:mr-4 md:text-4xl'>
							Welcome to my{' '}
							<span className='font-bold'>personal portfolio — </span> or, as I
							like to call it, my{' '}
							<span className='italic border-b border-b-primary-500'>
								playground
							</span>{' '}
							on the web.
						</h1>
						<section className='relative z-10'>
							<p className='text-base text-justify'>
								I&apos;m {siteConfig.name} — based in {siteConfig.location}, and
								I love electronics engineering, software engineering, and
								creative design. Whether I&apos;m tinkering with circuits,
								building software, or shaping how something looks and feels, I
								enjoy making ideas real and figuring things out along the way.
							</p>
						</section>
						<section className='relative z-10 flex space-x-4 items-center text-sm'>
							<div>
								<p>More about me: </p>
								<div className='flex -ml-2'>
									{socials.linkedin && (
										<Link
											href={socials.linkedin}
											target='_blank'
											rel='noreferrer'
											aria-label='linkedin'
											data-skip-splash-cursor
										>
											<LinkedinIcon className='h-9 w-9' />
										</Link>
									)}
									{socials.github && (
										<Link
											href={socials.github}
											target='_blank'
											rel='noreferrer'
											aria-label='github'
											data-skip-splash-cursor
										>
											<GithubIcon className='h-9 w-9' />
										</Link>
									)}
									{socials.x && (
										<Link
											href={socials.x}
											target='_blank'
											rel='noreferrer'
											aria-label='twitter'
											data-skip-splash-cursor
										>
											<XIcon className='h-9 w-9' />
										</Link>
									)}
									{socials.email && (
										<Link
											href={`mailto:${socials.email}`}
											aria-label='email'
											rel='noreferrer'
											data-skip-splash-cursor
										>
											<AtSignIcon className='h-9 w-9' />
										</Link>
									)}
								</div>
							</div>
							<div className='h-14 border-l border-gray-300' />
							<div
								className='flex flex-wrap space-x-3 space-y-1'
								data-skip-splash-cursor
							>
								<Link href='/projects'>/projects</Link>
								<Link href='/thoughts'>/thoughts</Link>
								<Link href='/uses'>/uses</Link>
								<Link href='/stats'>/stats</Link>
							</div>
						</section>
					</div>
				</div>
			</TechCursor>
		</main>
	);
}
