import React from "react";

import { Link } from "react-router";
import { NetworkIcon } from "lucide-react";

interface LegalLayoutProps {
	children: React.ReactNode;
}

export function LegalLayout({ children }: LegalLayoutProps): React.ReactNode {
	return (
		<div className="min-h-screen flex flex-col bg-white">
			<nav className="border-b">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
					<Link
						to="/"
						className="flex items-center gap-2 text-base font-bold tracking-tighter w-fit"
					>
						<NetworkIcon size={18} />
						<span>peersend.io</span>
					</Link>
				</div>
			</nav>

			<main className="flex-1">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
					{children}
				</div>
			</main>

			<footer className="border-t">
				<div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-wrap items-center justify-between gap-4">
					<Link
						to="/"
						className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
					>
						← Back to peersend.io
					</Link>
					<span className="text-xs uppercase tracking-widest text-muted-foreground">
						© {new Date().getFullYear()} peersend.io
					</span>
				</div>
			</footer>
		</div>
	);
}
