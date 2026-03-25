import React from "react";

import { useNavigate } from "react-router";

import { BrowserBanner } from "@/components/website/browser-banner";
import { CtaSection } from "@/components/website/cta-section";
import { FaqSection } from "@/components/website/faq-section";
import { FeaturesGrid } from "@/components/website/features-grid";
import { HeroSection } from "@/components/website/hero-section";
import { LandingFooter } from "@/components/website/landing-footer";
import { LandingNav } from "@/components/website/landing-nav";
import { ProcessSection } from "@/components/website/process-section";
import { StatsGrid } from "@/components/website/stats-grid";

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
				<BrowserBanner />
				<StatsGrid />
				<FeaturesGrid />
				<ProcessSection />
				<CtaSection onStartSending={handleStartSending} />
				<FaqSection />
			</main>
			<LandingFooter />
		</div>
	);
}
