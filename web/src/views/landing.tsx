import React from "react";
import { useNavigate } from "react-router";
import {
	LockIcon,
	ServerCrashIcon,
	ClockIcon,
	ZapIcon,
	ShieldCheckIcon,
	GlobeIcon,
	ArrowRightIcon,
	Share2Icon
} from "lucide-react";
import { envVar } from "@/config/constants";

type Feature = {
	icon: React.ReactNode;
	title: string;
	description: string;
};

type Stat = {
	value: string;
	label: string;
};

type ProcessStep = {
	step: string;
	title: string;
	description: string;
};

const FEATURES: Feature[] = [
	{
		icon: <LockIcon size={28} />,
		title: "End-to-End Encrypted",
		description: "WebRTC encryption ensures zero third-party access to your data streams."
	},
	{
		icon: <ServerCrashIcon size={28} />,
		title: "Zero Server Storage",
		description: "We have no record of your files. They never touch our disk, only our signaling pipe."
	},
	{
		icon: <ClockIcon size={28} />,
		title: "30-Minute Sessions",
		description: "Temporary by design. Sessions auto-expire if no connection is established."
	},
	{
		icon: <ZapIcon size={28} />,
		title: "Instant Transfer",
		description: "No upload queue. Transfer starts the moment you connect to the recipient."
	},
	{
		icon: <ShieldCheckIcon size={28} />,
		title: "Private by Default",
		description: "No accounts, no tracking, no analytics. Your identity remains yours alone."
	},
	{
		icon: <GlobeIcon size={28} />,
		title: "Any Device",
		description: "Works in any modern browser — desktop, mobile, or tablet with zero install."
	}
];

const STATS: Stat[] = [
	{ value: "500 MB", label: "Max file size" },
	{ value: "30 min", label: "Session lifetime" },
	{ value: "0 bytes", label: "Server storage" },
	{ value: "100%", label: "Encrypted" }
];

const PROCESS_STEPS: ProcessStep[] = [
	{
		step: "01.",
		title: "Create Session",
		description: "Click 'Start Sending' and receive a unique session code for your browser."
	},
	{
		step: "02.",
		title: "Share Code",
		description: "Send the code to your recipient via any secure messaging channel."
	},
	{
		step: "03.",
		title: "Transfer Files",
		description: "Connect directly and send up to 500MB per transfer instantly."
	}
];

const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge"];

function LandingNav({ onOpenApp }: { onOpenApp: () => void }): React.ReactNode {
	return (
		<nav className="bg-white sticky top-0 z-50 border-b border-gray-200 w-full">
			<div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center">
				<div className="flex items-center gap-2 text-xl font-bold tracking-tight text-gray-900">
					<Share2Icon size={20} className="text-teal-600" />
					<span>PeerSend</span>
				</div>
				<button
					onClick={onOpenApp}
					className="bg-teal-600 text-white px-6 py-2 text-sm font-semibold uppercase tracking-wider hover:bg-teal-700 transition-colors"
				>
					Open App
				</button>
			</div>
		</nav>
	);
}

function HeroSection({ onStartSending }: { onStartSending: () => void }): React.ReactNode {
	return (
		<section className="relative border-b border-gray-200 overflow-hidden">
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.07]"
				style={{
					backgroundImage: "radial-gradient(circle, #0f766e 1px, transparent 1px)",
					backgroundSize: "24px 24px"
				}}
			/>
			<div className="max-w-[1200px] mx-auto px-6 pt-24 pb-32 text-center relative z-10">
				<span className="inline-block border border-teal-600 text-teal-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 bg-white">
					WebRTC Powered • Zero Storage
				</span>
				<h1 className="font-semibold text-6xl md:text-8xl tracking-tight text-gray-900 mb-8 leading-[0.9]">
					Files sent.
					<br />
					Direct. Encrypted.
				</h1>
				<p className="max-w-2xl mx-auto text-gray-500 text-lg md:text-xl mb-12 font-medium">
					PeerSend establishes a WebRTC peer-to-peer channel between you and your recipient. Your files
					bypass our servers entirely.
				</p>
				<div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-16">
					<button
						onClick={onStartSending}
						className="bg-teal-600 text-white px-10 py-5 text-sm font-bold uppercase tracking-widest w-full md:w-auto hover:bg-teal-700 transition-colors"
					>
						Start Sending
					</button>
					<a
						href="https://github.com/peersend-io"
						target="_blank"
						rel="noopener noreferrer"
						className="border border-gray-400 text-gray-700 px-10 py-5 text-sm font-bold uppercase tracking-widest w-full md:w-auto hover:bg-gray-50 transition-colors text-center"
					>
						View on GitHub →
					</a>
				</div>
				<div className="inline-flex items-center gap-4 border border-gray-200 p-2 bg-gray-50">
					<span className="text-[10px] font-bold uppercase tracking-widest px-3 text-gray-400">
						Session Code
					</span>
					<div className="font-mono text-2xl font-bold text-teal-600 tracking-widest px-4 border-l border-gray-200">
						[ {envVar.SESSION_CODE_EXAMPLE} ]
					</div>
				</div>
			</div>
		</section>
	);
}

function BrowserBannerSection(): React.ReactNode {
	return (
		<section className="bg-gray-50 border-b border-gray-200 w-full">
			<div className="max-w-[1200px] mx-auto px-6 py-6 flex flex-wrap items-center justify-between gap-8">
				<span className="text-xs font-bold uppercase tracking-widest text-gray-400">
					Works in all modern browsers
				</span>
				<div className="flex items-center gap-10 opacity-50">
					{BROWSERS.map((browser) => (
						<div key={browser} className="flex items-center gap-2">
							<div className="w-4 h-4 rounded-full bg-gray-400" />
							<span className="text-xs font-bold uppercase tracking-tight text-gray-600">{browser}</span>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function FeaturesSection(): React.ReactNode {
	return (
		<section className="max-w-[1200px] mx-auto">
			<div className="border-x border-gray-200">
				<div className="border-b border-gray-200 p-10">
					<h2 className="text-3xl font-bold tracking-tight text-gray-900">
						Everything you&apos;d expect. Nothing you don&apos;t.
					</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-3">
					{FEATURES.map((feature, index) => {
						const isLastRow = index >= 3;
						const isLastInRow = (index + 1) % 3 === 0;
						return (
							<div
								key={feature.title}
								className={[
									"p-10 hover:bg-gray-50 transition-colors",
									!isLastRow ? "border-b border-gray-200" : "",
									!isLastInRow ? "border-r border-gray-200" : ""
								].join(" ")}
							>
								<div className="text-teal-600 mb-6">{feature.icon}</div>
								<h3 className="font-bold text-base mb-4 uppercase tracking-tight text-gray-900">
									{feature.title}
								</h3>
								<p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

function StatsSection(): React.ReactNode {
	return (
		<>
			<section className="max-w-[1200px] mx-auto border-x border-b border-gray-200">
				<div className="p-10">
					<h2 className="text-3xl font-bold tracking-tight text-gray-900">Over the past month</h2>
				</div>
			</section>
			<section className="max-w-[1200px] mx-auto border-x border-gray-200">
				<div className="grid grid-cols-2 md:grid-cols-4">
					{STATS.map((stat, index) => {
						const isLast = index === STATS.length - 1;
						return (
							<div
								key={stat.label}
								className={[
									"p-10 border-b border-gray-200 text-center",
									!isLast ? "border-r border-gray-200" : ""
								].join(" ")}
							>
								<div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
								<div className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
									{stat.label}
								</div>
							</div>
						);
					})}
				</div>
			</section>
		</>
	);
}

function ProcessSection(): React.ReactNode {
	return (
		<>
			<section className="max-w-[1200px] mx-auto border-x border-b border-gray-200">
				<div className="p-10">
					<h2 className="text-3xl font-bold tracking-tight text-gray-900">
						The technical path to privacy
					</h2>
				</div>
			</section>
			<section className="max-w-[1200px] mx-auto border-x border-b border-gray-200">
				<div className="flex flex-col md:flex-row">
					<div className="md:w-48 p-8 border-b md:border-b-0 md:border-r border-gray-200 flex items-start">
						<span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-600">
							Process
						</span>
					</div>
					<div className="flex-1 grid grid-cols-1 md:grid-cols-3">
						{PROCESS_STEPS.map((item, index) => {
							const isLast = index === PROCESS_STEPS.length - 1;
							return (
								<div
									key={item.step}
									className={[
										"p-8",
										!isLast ? "border-b md:border-b-0 md:border-r border-gray-200" : ""
									].join(" ")}
								>
									<div className="font-mono text-teal-600 text-xs font-bold mb-4">{item.step}</div>
									<h4 className="font-bold mb-2 uppercase tracking-tight text-sm text-gray-900">
										{item.title}
									</h4>
									<p className="text-gray-500 text-xs leading-relaxed">{item.description}</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>
		</>
	);
}

function CtaSection({ onStartSending }: { onStartSending: () => void }): React.ReactNode {
	return (
		<section className="max-w-[1200px] mx-auto border-x border-b border-gray-200">
			<div className="flex flex-col md:flex-row items-stretch">
				<div className="flex-1 p-12 md:p-20">
					<h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
						Ready to share?
					</h2>
					<p className="text-gray-500 text-xs font-medium uppercase tracking-widest">
						No account required.
					</p>
				</div>
				<div className="md:w-1/3 flex border-t md:border-t-0 md:border-l border-gray-200">
					<button
						onClick={onStartSending}
						className="w-full bg-teal-600 text-white p-12 text-base font-bold uppercase tracking-[0.2em] hover:bg-teal-700 transition-colors flex items-center justify-center gap-3"
					>
						Start Sending
						<ArrowRightIcon size={20} />
					</button>
				</div>
			</div>
		</section>
	);
}

function LandingFooter(): React.ReactNode {
	return (
		<footer className="max-w-[1200px] mx-auto mt-20 px-6 py-8 border-t border-gray-200 flex flex-wrap justify-between items-center gap-4">
			<div className="text-sm font-black text-gray-900 uppercase tracking-tight">PeerSend</div>
			<div className="flex gap-8 text-xs tracking-widest uppercase text-gray-400">
				<a
					href="/privacy"
					className="hover:text-teal-600 underline decoration-1 underline-offset-4 transition-colors"
				>
					Privacy Policy
				</a>
				<a
					href="/terms"
					className="hover:text-teal-600 underline decoration-1 underline-offset-4 transition-colors"
				>
					Terms
				</a>
			</div>
			<div className="text-xs tracking-widest uppercase text-gray-400">© 2025 PeerSend.io</div>
		</footer>
	);
}

export function LandingView(): React.ReactNode {
	const navigate = useNavigate();

	function handleOpenApp(): void {
		void navigate("/session/create");
	}

	function handleStartSending(): void {
		void navigate("/session/create");
	}

	return (
		<div className="min-h-screen bg-white">
			<LandingNav onOpenApp={handleOpenApp} />
			<main>
				<HeroSection onStartSending={handleStartSending} />
				<BrowserBannerSection />
				<FeaturesSection />
				<StatsSection />
				<ProcessSection />
				<CtaSection onStartSending={handleStartSending} />
			</main>
			<LandingFooter />
		</div>
	);
}
