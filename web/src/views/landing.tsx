import React from "react";

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
	return (
		<div className="min-h-screen bg-white">
			<LandingNav />
			<main>
				<HeroSection />
				<BrowserBanner />
				<StatsGrid />
				<FeaturesGrid />
				<ProcessSection />
				<CtaSection />
				<FaqSection />
			</main>
			<LandingFooter />
		</div>
	);
}
