import React from "react";

interface LatencyGraphProps {
	history: number[];
}

const WIDTH = 100;
const HEIGHT = 16;
const PADDING = 2;
const MAX_POINTS = 25;
const STEP = (WIDTH - PADDING * 2) / (MAX_POINTS - 1);

export function LatencyGraph({ history }: LatencyGraphProps): React.ReactNode {
	const visible = history.slice(1);
	if (visible.length < 2) {
		return <span>-</span>;
	}

	const min = Math.min(...visible);
	const max = Math.max(...visible);
	const range = max - min || 1;

	const coords = visible.map((value, i) => {
		const x = WIDTH - PADDING - (visible.length - 1 - i) * STEP;
		const y = PADDING + (1 - (value - min) / range) * (HEIGHT - PADDING * 2);
		return { x, y };
	});

	const d = coords.reduce((path, point, i) => {
		if (i === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
		const prev = coords[i - 1];
		const cpX = ((prev.x + point.x) / 2).toFixed(1);
		return `${path} C ${cpX} ${prev.y.toFixed(1)}, ${cpX} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
	}, "");

	const first = coords[0];
	const last = coords[coords.length - 1];
	const fillD = `${d} L ${last.x.toFixed(1)} ${HEIGHT} L ${first.x.toFixed(1)} ${HEIGHT} Z`;

	return (
		<svg
			width={WIDTH}
			height={HEIGHT}
			viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
			className="text-primary cursor-default"
		>
			<defs>
				<linearGradient id="latency-fill" x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
					<stop offset="100%" stopColor="currentColor" stopOpacity="0" />
				</linearGradient>
			</defs>
			<path d={fillD} fill="url(#latency-fill)" stroke="none" />
			<path
				d={d}
				fill="none"
				stroke="currentColor"
				strokeWidth="1.5"
				strokeLinejoin="round"
				strokeLinecap="round"
			/>
		</svg>
	);
}
