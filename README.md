# Joseph Tam — Portfolio

Personal portfolio and blog.

- **Framework**: [Next.js](https://nextjs.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Content**: [MDX](https://mdxjs.com/)
- **Animation**: GSAP, Lenis, Motion

## Running locally

```bash
npm install
cp .env.example .env.local   # optional, see below
npm run dev
```

Open http://localhost:3000.

## Customizing

- Personal details (name, role, socials, GitHub username): `app/site-config.ts`
- Home page copy: `app/components/hero/hero.tsx`
- Projects: `app/projects/constants.ts` (screenshots go in `public/static/images/project/`)
- Blog posts ("thoughts"): add `.mdx` files to `app/thoughts/posts/`
- Uses page: `app/uses/content.mdx`

## Environment variables

All optional. Set `NEXT_PUBLIC_SITE_URL` to your production URL for correct sitemap/SEO.

| Variable                                                                | Purpose                                |
| ----------------------------------------------------------------------- | -------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                                                  | Canonical site URL                     |
| `GITHUB_TOKEN`                                                          | GitHub contributions graph on `/stats` |
| `WAKATIME_SECRET_KEY`                                                   | WakaTime coding stats on `/stats`      |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` / `SPOTIFY_REFRESH_TOKEN` | Spotify widgets on `/stats`            |
| `NEXT_PUBLIC_LOGROCKET_ID`                                              | LogRocket session replay               |
| `NEXT_PUBLIC_UMAMI_WEBSITE_ID` / `NEXT_PUBLIC_UMAMI_WEBSITE_URL`        | Umami analytics                        |

## Credits

Design and structure based on [dlarroder/dalelarroder](https://github.com/dlarroder/dalelarroder) (MIT, © Dale Larroder).
