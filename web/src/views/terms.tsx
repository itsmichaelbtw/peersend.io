import React from "react";

import { Link } from "react-router";

import { LegalLayout } from "@/layouts/legal-layout";

export function TermsView(): React.ReactNode {
	return (
		<LegalLayout>
			<article className="prose-sm sm:prose max-w-none">
				<div className="mb-10">
					<span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary border border-primary/30 px-3 py-1 bg-secondary">
						Legal
					</span>
					<h1 className="text-3xl sm:text-4xl font-bold tracking-tighter mt-6 mb-2">
						Terms of Service
					</h1>
					<p className="text-muted-foreground text-sm">Effective date: April 2025</p>
				</div>

				<div className="space-y-10 text-sm leading-relaxed text-foreground">
					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Introduction</h2>
						<p className="text-muted-foreground">
							These Terms of Service ("Terms") govern your use of PeerSend.io ("Service"), a
							browser-based peer-to-peer file transfer tool operated by peersend.io. By using the
							Service, you agree to these Terms. If you do not agree, please do not use the Service.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Use of Service</h2>
						<p className="text-muted-foreground">
							PeerSend.io is a free tool that facilitates direct, browser-to-browser file transfers
							using WebRTC technology. No account registration is required. You may use the Service
							for personal or commercial purposes, provided you comply with these Terms and all
							applicable laws.
						</p>
						<p className="text-muted-foreground mt-3">
							The Service is provided "as is" without any guarantee of uptime, availability, or
							transfer reliability. We reserve the right to modify, suspend, or discontinue the
							Service at any time without notice.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Acceptable Use</h2>
						<p className="text-muted-foreground">You agree not to use the Service to:</p>
						<ul className="list-none mt-3 space-y-2 text-muted-foreground">
							{[
								"Transfer files that infringe on intellectual property rights.",
								"Distribute malware, viruses, or other harmful software.",
								"Engage in any activity that is illegal under applicable law.",
								"Attempt to interfere with, disrupt, or gain unauthorized access to the Service or its infrastructure.",
								"Use the Service to harass, threaten, or harm others."
							].map((item) => (
								<li key={item} className="flex gap-2">
									<span className="text-primary font-bold shrink-0">—</span>
									<span>{item}</span>
								</li>
							))}
						</ul>
						<p className="text-muted-foreground mt-3">
							Because file transfers are peer-to-peer and our servers never receive or store your
							files, you are solely responsible for the content you transmit.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Disclaimers</h2>
						<p className="text-muted-foreground">
							THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
							EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS
							FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL
							BE UNINTERRUPTED, ERROR-FREE, OR THAT FILES WILL BE TRANSFERRED WITHOUT LOSS OR
							CORRUPTION.
						</p>
						<p className="text-muted-foreground mt-3">
							WebRTC connections depend on network conditions and browser capabilities outside our
							control. Transfer success is not guaranteed on all networks or device configurations.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">
							Limitation of Liability
						</h2>
						<p className="text-muted-foreground">
							TO THE MAXIMUM EXTENT PERMITTED BY LAW, PEERSEND.IO AND ITS OPERATORS SHALL NOT BE
							LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
							INCLUDING LOSS OF DATA, LOSS OF REVENUE, OR ANY OTHER LOSSES ARISING FROM YOUR USE OF
							THE SERVICE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Changes to Terms</h2>
						<p className="text-muted-foreground">
							We may update these Terms from time to time. The effective date at the top of this page
							will reflect the date of the latest revision. Continued use of the Service after any
							changes constitutes your acceptance of the revised Terms. We encourage you to review
							these Terms periodically.
						</p>
					</section>

					<section>
						<h2 className="text-base font-bold uppercase tracking-tight mb-3">Contact</h2>
						<p className="text-muted-foreground">
							If you have questions or concerns about these Terms, please contact us at{" "}
							<a
								href="mailto:support@peersend.io"
								className="text-primary underline underline-offset-4"
							>
								support@peersend.io
							</a>
							.
						</p>
					</section>

					<div className="border-t pt-6 text-xs text-muted-foreground">
						See also:{" "}
						<Link to="/privacy" className="text-primary underline underline-offset-4">
							Privacy Policy
						</Link>
					</div>
				</div>
			</article>
		</LegalLayout>
	);
}
