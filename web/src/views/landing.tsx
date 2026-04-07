import React from "react";

import {
	WEBSITE_BROWSER_ENTRIES,
	WEBSITE_FAQ_ITEMS,
	WEBSITE_FEATURES,
	WEBSITE_GITHUB_URL,
	WEBSITE_PROCESS_STEPS,
	WEBSITE_STATS
} from "@/config/constants";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { NetworkIcon } from "lucide-react";
import { Link } from "react-router";

export function LandingView(): React.ReactNode {
	return (
		<div className="min-h-screen">
			<main>
				<section className="relative border-b overflow-hidden">
					<div className="min-h-screen w-full relative">
						<div
							className="absolute inset-0 z-0"
							style={{
								backgroundImage: `
        linear-gradient(to right, #e7e5e4 1px, transparent 1px),
        linear-gradient(to bottom, #e7e5e4 1px, transparent 1px)
      `,
								backgroundSize: "20px 20px",
								backgroundPosition: "0 0, 0 0",
								maskImage: `
         repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
      `,
								WebkitMaskImage: `
  repeating-linear-gradient(
              to right,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            repeating-linear-gradient(
              to bottom,
              black 0px,
              black 3px,
              transparent 3px,
              transparent 8px
            ),
            radial-gradient(ellipse 100% 80% at 50% 100%, #000 50%, transparent 90%)
      `,
								maskComposite: "intersect",
								WebkitMaskComposite: "source-in"
							}}
						/>
						<nav className="top-0 z-50 w-full relative">
							<div className="max-w-300 mx-auto px-3 sm:px-4 md:px-6 py-4 flex justify-between items-center">
								<div className="flex items-center gap-2 text-xl font-bold tracking-tighter">
									<NetworkIcon size={20} />
									<span>PeerSend</span>
								</div>
								<Button asChild size="sm">
									<Link to="/session/create">Open App</Link>
								</Button>
							</div>
						</nav>
						<div className="max-w-300 mx-auto px-3 sm:px-4 md:px-6 pt-24 pb-32 text-center relative z-10">
							<span className="inline-block border border-primary/30 text-primary px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 bg-secondary">
								WebRTC Powered • Zero Storage
							</span>
							<h1 className="font-semibold text-4xl md:text-6xl lg:text-8xl tracking-tighter mb-8 leading-[0.9]">
								Files Sent. Direct. <span className="text-primary">Encrypted.</span>
							</h1>
							<p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-12 font-medium">
								PeerSend establishes a WebRTC peer-to-peer channel between you and your recipient.
								Your files bypass our servers entirely.
							</p>
							<div className="flex flex-col md:flex-row items-center justify-center gap-4">
								<Button asChild size="sm" className="w-full md:w-auto">
									<Link to="/session/create">Start Sending</Link>
								</Button>
								<Button asChild variant="outline" size="sm" className="w-full md:w-auto bg-white!">
									<a href={WEBSITE_GITHUB_URL} target="_blank" rel="noopener noreferrer">
										View on GitHub →
									</a>
								</Button>
							</div>
						</div>
					</div>
				</section>

				<section className="w-full border-b bg-secondary">
					<div className="max-w-300 mx-auto px-3 sm:px-4 md:px-6 py-6 flex flex-wrap items-center justify-between gap-8">
						<span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
							Works in all modern browsers
						</span>
						<div className="flex items-center gap-10">
							{WEBSITE_BROWSER_ENTRIES.map(({ name, Svg }) => (
								<div
									key={name}
									className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition cursor-default"
								>
									<Svg width={18} height={18} aria-hidden />
									<span className="text-xs font-bold uppercase tracking-tight text-foreground">
										{name}
									</span>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="max-w-300 mx-auto md:border-x bg-white">
					<div className="grid grid-cols-2 md:grid-cols-4">
						{WEBSITE_STATS.map((stat, index) => (
							<div
								key={stat.label}
								className={clsx(
									"text-center p-10 border-b",
									index < WEBSITE_STATS.length - 1 && "border-r"
								)}
							>
								<div className="text-2xl md:text-4xl font-black text-foreground mb-2">
									{stat.value}
								</div>
								<div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
									{stat.label}
								</div>
							</div>
						))}
					</div>
				</section>

				<section className="max-w-300 mx-auto md:border-x border-b">
					<div className="h-8 w-full relative border-b">
						<div className="absolute inset-0 bg-[linear-gradient(-45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
					</div>
					<div className="border-b p-10">
						<h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
							Everything you&apos;d expect<span className="text-primary">.</span> Nothing you
							don&apos;t<span className="text-primary">.</span>
						</h2>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3">
						{WEBSITE_FEATURES.map(({ Icon, title, description }, index) => {
							const isLastItem = index === WEBSITE_FEATURES.length - 1;
							const isLastInRow = (index + 1) % 3 === 0;
							const isSecondRow = index >= 3;

							return (
								<div
									key={title}
									className={clsx(
										"p-10 hover:bg-secondary transition-colors",
										!isLastItem && "border-b",
										isSecondRow && !isLastItem && "md:border-b-0",
										!isLastInRow && "border-r"
									)}
								>
									<Icon size={28} className="text-primary mb-6" />
									<h3 className="font-bold text-base md:text-lg mb-3 uppercase tracking-tight text-foreground">
										{title}
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
								</div>
							);
						})}
					</div>
				</section>

				<section className="max-w-300 mx-auto md:border-x border-b">
					<div className="h-8 w-full relative border-b">
						<div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,var(--color-border)_48%,var(--color-border)_52%,transparent_52%)] bg-size-[20px_20px]" />
					</div>
					<div className="border-b p-10">
						<h2 className="text-xl md:text-3xl font-bold tracking-tight text-foreground">
							The technical path to privacy<span className="text-primary">.</span>
						</h2>
					</div>
					<div className="flex flex-col md:flex-row">
						<div className="md:w-48 p-8 border-b md:border-b-0 flex items-start border-r bg-secondary not-md:hidden" />
						<div className="flex-1 grid grid-cols-1 md:grid-cols-3">
							{WEBSITE_PROCESS_STEPS.map((item, index) => (
								<div
									key={item.step}
									className={clsx(
										"p-8",
										index < WEBSITE_PROCESS_STEPS.length - 1 && "border-b md:border-b-0 md:border-r"
									)}
								>
									<div className="font-mono text-primary text-xs font-bold mb-4">{item.step}</div>
									<h4 className="font-bold mb-2 uppercase tracking-tight text-sm text-foreground">
										{item.title}
									</h4>
									<p className="text-muted-foreground text-xs leading-relaxed">
										{item.description}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>

				<section className="max-w-300 mx-auto md:border-x">
					<div className="flex flex-col md:flex-row items-stretch">
						<div className="flex-1 p-12 md:p-20">
							<h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 text-foreground">
								Ready to share?
							</h2>
							<p className="text-muted-foreground font-medium uppercase tracking-widest text-[12px]">
								No account required.
							</p>
						</div>
						<Link
							to="/session/create"
							className="md:w-1/3 flex border-t md:border-t-0 bg-primary -mt-px -mx-px"
						>
							<div className="" />
						</Link>
					</div>
				</section>

				<section className="mx-auto bg-foreground text-background">
					<div className="p-12 md:p-20 max-w-3xl mx-auto flex flex-col justify-center">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-16 border-b border-white/10 pb-8">
							FREQUENTLY ASKED QUESTIONS
						</h2>
						<div className="space-y-12">
							{WEBSITE_FAQ_ITEMS.map((item) => (
								<div key={item.question}>
									<h4 className="font-bold text-base md:text-lg mb-4 text-background">
										{item.question}
									</h4>
									<p className="text-background/70 text-sm leading-relaxed max-w-2xl">
										{item.answer}
									</p>
								</div>
							))}
						</div>
					</div>
				</section>
			</main>

			<footer className="bg-white max-w-300 mx-auto px-3 sm:px-4 md:px-6 py-8 flex flex-wrap justify-between items-center gap-4">
				<div className="text-sm font-black text-foreground uppercase tracking-tighter">
					PeerSend
				</div>
				<div className="flex gap-8">
					<a
						href="/privacy"
						className="text-muted-foreground text-sm uppercase tracking-widest underline-offset-4 hover:text-foreground"
					>
						Privacy Policy
					</a>
					<a
						href="/terms"
						className="text-muted-foreground text-sm uppercase tracking-widest underline-offset-4 hover:text-foreground"
					>
						Terms
					</a>
				</div>
				<div className="text-xs tracking-widest uppercase text-muted-foreground">
					© 2025 PeerSend.io
				</div>
			</footer>
		</div>
	);
}
