'use client';

import classNames from 'classnames';
import { type ReactNode, useEffect, useRef } from 'react';

const GRID_SIZE = 32;
const PLUS_EVERY = 4;
const NODE_AREA = 16000; // px² of hero per drifting node
const MAX_NODES = 110;
const LINK_DISTANCE = 140;
const POINTER_RADIUS = 200;
const TRAIL_LENGTH = 22;
const PING_LIFETIME = 45;
const PRIMARY = '222, 29, 141'; // matches --color-primary-500
// Elements whose text the HUD readout should get out of the way of
const TEXT_SELECTOR = 'h1, h2, h3, p, a, button, li, label';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

type Node = { x: number; y: number; vx: number; vy: number; r: number };
type Ping = { x: number; y: number; age: number };
type Point = { x: number; y: number };

const pad = (value: number) =>
	String(Math.max(0, Math.round(value))).padStart(4, '0');

/**
 * Techy pointer-reactive background: a dot grid that lights up and bends toward
 * the cursor, a drifting node network that links to it, a lagging reticle with
 * live coordinates, a fading trail, click pings and a slow scan line.
 * Links/buttons (or anything with `data-skip-splash-cursor`) make the reticle
 * lock on with corner brackets. Honors `prefers-reduced-motion`.
 */
export default function TechCursor({
	children,
	className,
	containerClassName,
}: {
	children?: ReactNode;
	className?: string;
	containerClassName?: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const container = containerRef.current;
		if (!canvas || !container) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		let reduced = motionQuery.matches;
		const onMotionChange = (e: MediaQueryListEvent) => {
			reduced = e.matches;
		};
		motionQuery.addEventListener('change', onMotionChange);

		let width = 0;
		let height = 0;
		let nodes: Node[] = [];
		const trail: Point[] = [];
		const pings: Ping[] = [];
		const pointer = {
			x: 0,
			y: 0,
			sx: 0,
			sy: 0,
			speed: 0,
			presence: 0,
			radius: 16,
			seen: false,
			inside: false,
			locked: false,
			overText: false,
			textFade: 0,
		};
		let visible = true;
		let rafId = 0;
		let last = performance.now();
		let time = 0;

		const resize = () => {
			const rect = container.getBoundingClientRect();
			const dpr = Math.min(window.devicePixelRatio || 1, 2);
			width = rect.width;
			height = rect.height;
			canvas.width = Math.round(width * dpr);
			canvas.height = Math.round(height * dpr);
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

			const count = Math.min(
				MAX_NODES,
				Math.round((width * height) / NODE_AREA),
			);
			nodes = Array.from({ length: count }, () => ({
				x: Math.random() * width,
				y: Math.random() * height,
				vx: (Math.random() - 0.5) * 0.3,
				vy: (Math.random() - 0.5) * 0.3,
				r: 1 + Math.random() * 1.2,
			}));
		};

		const isText = (cx: number, cy: number) => {
			const el = document.elementFromPoint(cx, cy);
			return el !== null && el.closest(TEXT_SELECTOR) !== null;
		};

		const onMove = (e: PointerEvent) => {
			const rect = container.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			pointer.inside = x >= 0 && y >= 0 && x <= width && y <= height;
			if (!pointer.inside) return;
			if (!pointer.seen) {
				pointer.sx = x;
				pointer.sy = y;
				pointer.seen = true;
			}
			pointer.x = x;
			pointer.y = y;
			pointer.locked =
				e.target instanceof Element &&
				e.target.closest('a, button, [data-skip-splash-cursor]') !== null;

			// Is there text under the cursor, or where the readout would be drawn?
			const dir = x > width - 180 ? -1 : 1;
			const ax = e.clientX + dir * (pointer.radius + 16);
			pointer.overText =
				isText(e.clientX, e.clientY) ||
				isText(ax + dir * 20, e.clientY - 8) ||
				isText(ax + dir * 20, e.clientY + 8) ||
				isText(ax + dir * 70, e.clientY);
		};

		const onDown = (e: PointerEvent) => {
			onMove(e);
			if (pointer.inside) pings.push({ x: pointer.x, y: pointer.y, age: 0 });
		};

		const onLeave = () => {
			pointer.inside = false;
		};

		const draw = (now: number) => {
			rafId = requestAnimationFrame(draw);
			if (!visible || document.hidden) {
				last = now;
				return;
			}
			const dt = Math.min((now - last) / 16.667, 3);
			last = now;
			time += dt;

			const dark = document.documentElement.classList.contains('dark');
			const ink = dark ? '255, 255, 255' : '0, 0, 0';

			ctx.clearRect(0, 0, width, height);

			// --- pointer state -------------------------------------------------
			const wantPresence = pointer.inside && pointer.seen ? 1 : 0;
			pointer.presence += (wantPresence - pointer.presence) * (1 - 0.88 ** dt);
			const prevX = pointer.sx;
			const prevY = pointer.sy;
			const follow = reduced ? 1 : 1 - 0.78 ** dt;
			pointer.sx += (pointer.x - pointer.sx) * follow;
			pointer.sy += (pointer.y - pointer.sy) * follow;
			const frameSpeed =
				Math.hypot(pointer.sx - prevX, pointer.sy - prevY) / dt;
			pointer.speed += (frameSpeed - pointer.speed) * 0.15;
			const presence = pointer.presence;
			pointer.textFade +=
				((pointer.overText ? 1 : 0) - pointer.textFade) * (1 - 0.8 ** dt);
			// Fade the HUD labels/guides out while they would sit on top of text
			const labelAlpha = presence * (1 - pointer.textFade);
			const guideAlpha = presence * (1 - 0.7 * pointer.textFade);
			const { sx, sy } = pointer;

			// --- scan line -----------------------------------------------------
			if (!reduced) {
				const band = 140;
				const y = ((time * 0.6) % (height + band * 2)) - band;
				const g = ctx.createLinearGradient(0, y - band / 2, 0, y + band / 2);
				g.addColorStop(0, `rgba(${PRIMARY}, 0)`);
				g.addColorStop(0.5, `rgba(${PRIMARY}, ${dark ? 0.07 : 0.05})`);
				g.addColorStop(1, `rgba(${PRIMARY}, 0)`);
				ctx.fillStyle = g;
				ctx.fillRect(0, y - band / 2, width, band);
			}

			// --- dot grid ------------------------------------------------------
			const near: { x: number; y: number; f: number }[] = [];
			ctx.fillStyle = `rgba(${ink}, 0.14)`;
			for (let gx = GRID_SIZE / 2; gx < width; gx += GRID_SIZE) {
				for (let gy = GRID_SIZE / 2; gy < height; gy += GRID_SIZE) {
					const dx = sx - gx;
					const dy = sy - gy;
					const d = Math.hypot(dx, dy);
					if (presence > 0.01 && d < POINTER_RADIUS) {
						near.push({ x: gx, y: gy, f: (1 - d / POINTER_RADIUS) * presence });
					} else {
						ctx.fillRect(gx - 0.75, gy - 0.75, 1.5, 1.5);
					}
				}
			}
			for (const dot of near) {
				const dx = sx - dot.x;
				const dy = sy - dot.y;
				const d = Math.hypot(dx, dy) || 1;
				const pull = dot.f * dot.f * 7;
				const px = dot.x + (dx / d) * pull;
				const py = dot.y + (dy / d) * pull;
				const size = 1.5 + dot.f * 2.6;
				const hot = dot.f > 0.35;
				ctx.fillStyle = `rgba(${hot ? PRIMARY : ink}, ${0.14 + dot.f * 0.8})`;
				ctx.fillRect(px - size / 2, py - size / 2, size, size);
			}

			// --- registration "+" marks ---------------------------------------
			ctx.strokeStyle = `rgba(${ink}, 0.2)`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			const step = GRID_SIZE * PLUS_EVERY;
			for (let gx = GRID_SIZE / 2; gx < width; gx += step) {
				for (let gy = GRID_SIZE / 2; gy < height; gy += step) {
					ctx.moveTo(gx - 4, gy);
					ctx.lineTo(gx + 4, gy);
					ctx.moveTo(gx, gy - 4);
					ctx.lineTo(gx, gy + 4);
				}
			}
			ctx.stroke();

			// --- node network --------------------------------------------------
			const drawn: Point[] = [];
			for (const n of nodes) {
				if (!reduced) {
					n.x += n.vx * dt;
					n.y += n.vy * dt;
					if (n.x < -10) n.x = width + 10;
					if (n.x > width + 10) n.x = -10;
					if (n.y < -10) n.y = height + 10;
					if (n.y > height + 10) n.y = -10;
				}
				const dx = sx - n.x;
				const dy = sy - n.y;
				const d = Math.hypot(dx, dy) || 1;
				if (presence > 0.01 && d < POINTER_RADIUS) {
					const f = (1 - d / POINTER_RADIUS) * presence;
					const pull = f * f * 22;
					drawn.push({ x: n.x + (dx / d) * pull, y: n.y + (dy / d) * pull });
				} else {
					drawn.push({ x: n.x, y: n.y });
				}
			}

			ctx.lineWidth = 1;
			for (let i = 0; i < drawn.length; i++) {
				for (let j = i + 1; j < drawn.length; j++) {
					const d = Math.hypot(
						drawn[i].x - drawn[j].x,
						drawn[i].y - drawn[j].y,
					);
					if (d > LINK_DISTANCE) continue;
					const mx = (drawn[i].x + drawn[j].x) / 2;
					const my = (drawn[i].y + drawn[j].y) / 2;
					const nearPointer =
						presence > 0.01 && Math.hypot(sx - mx, sy - my) < POINTER_RADIUS;
					const a =
						(1 - d / LINK_DISTANCE) *
						(nearPointer ? 0.45 * presence + 0.1 : 0.16);
					ctx.strokeStyle = `rgba(${nearPointer ? PRIMARY : ink}, ${a})`;
					ctx.beginPath();
					ctx.moveTo(drawn[i].x, drawn[i].y);
					ctx.lineTo(drawn[j].x, drawn[j].y);
					ctx.stroke();
				}
			}

			// links from the pointer to nearby nodes
			if (presence > 0.01) {
				for (const p of drawn) {
					const d = Math.hypot(sx - p.x, sy - p.y);
					if (d > POINTER_RADIUS) continue;
					ctx.strokeStyle = `rgba(${PRIMARY}, ${(1 - d / POINTER_RADIUS) * 0.65 * presence})`;
					ctx.beginPath();
					ctx.moveTo(sx, sy);
					ctx.lineTo(p.x, p.y);
					ctx.stroke();
				}
			}

			for (let i = 0; i < drawn.length; i++) {
				const p = drawn[i];
				const r = nodes[i].r;
				const hot =
					presence > 0.01 && Math.hypot(sx - p.x, sy - p.y) < POINTER_RADIUS;
				ctx.fillStyle = `rgba(${hot ? PRIMARY : ink}, ${hot ? 0.9 : 0.35})`;
				ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
			}

			// --- crosshair, rulers, trail, reticle ----------------------------
			if (presence > 0.01) {
				// dashed crosshair through the real pointer position
				ctx.save();
				ctx.setLineDash([4, 8]);
				ctx.strokeStyle = `rgba(${ink}, ${0.13 * guideAlpha})`;
				ctx.beginPath();
				ctx.moveTo(0, pointer.y);
				ctx.lineTo(width, pointer.y);
				ctx.moveTo(pointer.x, 0);
				ctx.lineTo(pointer.x, height);
				ctx.stroke();
				ctx.restore();

				// edge rulers
				ctx.strokeStyle = `rgba(${PRIMARY}, ${0.9 * presence})`;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(pointer.x, 0);
				ctx.lineTo(pointer.x, 12);
				ctx.moveTo(0, pointer.y);
				ctx.lineTo(12, pointer.y);
				ctx.stroke();
				ctx.lineWidth = 1;

				// trail
				if (!reduced) {
					trail.push({ x: sx, y: sy });
					if (trail.length > TRAIL_LENGTH) trail.shift();
					for (let i = 1; i < trail.length; i++) {
						const t = i / trail.length;
						ctx.strokeStyle = `rgba(${PRIMARY}, ${t * 0.55 * presence})`;
						ctx.lineWidth = 0.5 + t * 1.8;
						ctx.beginPath();
						ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
						ctx.lineTo(trail[i].x, trail[i].y);
						ctx.stroke();
						if (i % 4 === 0) {
							const s = 2 + t * 3;
							ctx.fillStyle = `rgba(${PRIMARY}, ${t * 0.6 * presence})`;
							ctx.fillRect(trail[i].x - s / 2, trail[i].y - s / 2, s, s);
						}
					}
					ctx.lineWidth = 1;
				}

				// reticle
				const targetRadius = pointer.locked
					? 18
					: 16 + Math.min(pointer.speed, 20) * 0.6;
				pointer.radius += (targetRadius - pointer.radius) * (1 - 0.8 ** dt);
				const r = pointer.radius;
				ctx.strokeStyle = `rgba(${PRIMARY}, ${presence})`;
				ctx.fillStyle = `rgba(${PRIMARY}, ${presence})`;
				ctx.lineWidth = 1.5;
				if (pointer.locked) {
					// corner brackets
					const c = r + 2;
					const l = 7;
					ctx.beginPath();
					for (const [kx, ky] of [
						[-1, -1],
						[1, -1],
						[1, 1],
						[-1, 1],
					]) {
						ctx.moveTo(sx + kx * c, sy + ky * (c - l));
						ctx.lineTo(sx + kx * c, sy + ky * c);
						ctx.lineTo(sx + kx * (c - l), sy + ky * c);
					}
					ctx.stroke();
				} else {
					const rot = reduced ? 0 : time * 0.035;
					ctx.beginPath();
					for (let k = 0; k < 4; k++) {
						const a = rot + (k * Math.PI) / 2;
						ctx.moveTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r);
						ctx.arc(sx, sy, r, a, a + 0.9);
					}
					ctx.stroke();

					ctx.save();
					ctx.setLineDash([2, 5]);
					ctx.strokeStyle = `rgba(${ink}, ${0.3 * presence})`;
					ctx.lineWidth = 1;
					ctx.beginPath();
					ctx.arc(sx, sy, r + 10, -rot * 0.6, Math.PI * 2 - rot * 0.6);
					ctx.stroke();
					ctx.restore();
				}
				ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);

				// coordinate readout
				const flip = sx > width - 180;
				const tx = sx + (flip ? -(r + 16) : r + 16);
				ctx.font = `11px ${MONO}`;
				ctx.textAlign = flip ? 'right' : 'left';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = `rgba(${ink}, ${0.75 * labelAlpha})`;
				ctx.fillText(`X:${pad(pointer.x)}  Y:${pad(pointer.y)}`, tx, sy - 8);
				ctx.fillStyle = `rgba(${PRIMARY}, ${0.9 * labelAlpha})`;
				ctx.fillText(
					pointer.locked ? 'TARGET//LOCK' : `V:${pointer.speed.toFixed(1)}`,
					tx,
					sy + 8,
				);
			} else if (trail.length) {
				trail.length = 0;
			}

			// --- click pings ---------------------------------------------------
			for (let i = pings.length - 1; i >= 0; i--) {
				const p = pings[i];
				p.age += dt;
				if (p.age > PING_LIFETIME) {
					pings.splice(i, 1);
					continue;
				}
				const t = p.age / PING_LIFETIME;
				const a = 1 - t;
				ctx.strokeStyle = `rgba(${PRIMARY}, ${a * 0.8})`;
				ctx.lineWidth = 1.5;
				ctx.beginPath();
				ctx.arc(p.x, p.y, 8 + t * 90, 0, Math.PI * 2);
				ctx.stroke();
				const s = 6 + t * 50;
				ctx.strokeStyle = `rgba(${ink}, ${a * 0.4})`;
				ctx.lineWidth = 1;
				ctx.strokeRect(p.x - s, p.y - s, s * 2, s * 2);
			}
		};

		resize();
		const resizeObserver = new ResizeObserver(resize);
		resizeObserver.observe(container);
		const intersectionObserver = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
		});
		intersectionObserver.observe(container);

		window.addEventListener('pointermove', onMove, { passive: true });
		window.addEventListener('pointerdown', onDown, { passive: true });
		document.documentElement.addEventListener('mouseleave', onLeave);
		window.addEventListener('blur', onLeave);
		rafId = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
			intersectionObserver.disconnect();
			motionQuery.removeEventListener('change', onMotionChange);
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerdown', onDown);
			document.documentElement.removeEventListener('mouseleave', onLeave);
			window.removeEventListener('blur', onLeave);
		};
	}, []);

	return (
		<div
			ref={containerRef}
			className={classNames('relative overflow-hidden', containerClassName)}
		>
			<canvas
				ref={canvasRef}
				className={classNames(
					'pointer-events-none absolute inset-0 h-full w-full',
					className,
				)}
			/>
			{children}
		</div>
	);
}
