import React from "react";

import { Link } from "react-router";

import { LegalLayout } from "@/layouts/legal-layout";

const EFFECTIVE_DATE = "April 2026";

export function PrivacyView(): React.ReactNode {
	return (
		<LegalLayout>
			<article className="prose-sm sm:prose max-w-none">
				<div className="mb-10">
					<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary border border-primary/30 px-3 py-1 bg-secondary">
						Legal
					</span>
					<h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mt-6 mb-2">
						Privacy Policy
					</h1>
					<p className="text-muted-foreground text-sm">Effective date: {EFFECTIVE_DATE}</p>
				</div>

				<div className="space-y-10 text-sm leading-relaxed text-foreground">
					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Introduction</h2>
						<p className="text-muted-foreground">
							PeerSend.io is designed from the ground up with privacy as a core principle. This
							Privacy Policy explains what information we collect (very little), why, and how we
							handle it. By using the Service, you agree to the practices described here.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">What We Collect</h2>
						<p className="text-muted-foreground">We collect almost nothing. Specifically:</p>
						<ul className="list-none mt-3 space-y-3 text-muted-foreground">
							{[
								{
									label: "No files",
									detail:
										"Your files are transferred directly browser-to-browser via WebRTC. They never touch our servers."
								},
								{
									label: "No personal data",
									detail:
										"We do not collect your name, email address, or any other identifying information. No account is required to use the Service."
								},
								{
									label: "No tracking cookies",
									detail: "We do not use cookies for tracking, analytics, or advertising purposes."
								},
								{
									label: "Minimal server logs",
									detail:
										"Our WebSocket signaling server may temporarily log connection events (IP address, connection time) for operational purposes. These logs are not retained long-term and are not linked to any identity."
								}
							].map(({ label, detail }) => (
								<li key={label} className="flex gap-2">
									<span className="text-primary font-bold shrink-0">—</span>
									<span>
										<strong className="text-foreground font-semibold">{label}:</strong> {detail}
									</span>
								</li>
							))}
						</ul>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">
							WebRTC and Peer Connections
						</h2>
						<p className="text-muted-foreground">
							PeerSend.io uses WebRTC to establish a direct, encrypted channel between peers. The
							DTLS-SRTP encryption is built into the WebRTC protocol itself — your files are
							encrypted in transit end-to-end between browsers.
						</p>
						<p className="text-muted-foreground mt-3">
							Our signaling server facilitates the initial WebRTC handshake (exchanging ICE
							candidates and session descriptions) but does not have access to your files or the
							content of the data channel. Once the peer connection is established, all data flows
							directly between browsers.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Session Codes</h2>
						<p className="text-muted-foreground">
							Session codes are randomly generated identifiers used to pair two peers. They are
							ephemeral — they exist only for the duration of your browser session and are discarded
							when you close the tab or the session ends. Session codes are not stored persistently
							on our servers and cannot be used to identify you.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">
							Third-Party Services
						</h2>
						<p className="text-muted-foreground">
							PeerSend.io does not integrate any third-party analytics, advertising, or tracking
							services. We do not share any data with third parties because we do not collect data
							to share.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Your Rights</h2>
						<p className="text-muted-foreground">
							Because we do not collect or store personal data, there is generally nothing to
							access, correct, or delete. If you have concerns about operational logs or any other
							data-related matter, please contact us and we will do our best to assist.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Changes</h2>
						<p className="text-muted-foreground">
							We may update this Privacy Policy from time to time. The effective date at the top of
							this page reflects the date of the latest revision. Continued use of the Service after
							any changes constitutes your acceptance of the revised policy.
						</p>
					</section>

					<div className="border-t pt-6 text-xs text-muted-foreground">
						See also:{" "}
						<Link to="/terms" className="text-primary underline underline-offset-4">
							Terms of Service
						</Link>
					</div>
				</div>
			</article>
		</LegalLayout>
	);
}
