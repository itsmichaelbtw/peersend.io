import React from "react";
import { Helmet } from "react-helmet-async";

interface SeoProps {
	title?: string;
	description: string;
	canonical?: string;
	noIndex?: boolean;
}

const SITE_NAME = "peersend.io";
const DEFAULT_TITLE =
	"peersend.io — Peer-to-peer file sharing, encrypted end-to-end, no account needed";
const OG_IMAGE = "https://peersend.io/og-image.png";

export function Seo({ title, description, canonical, noIndex = false }: SeoProps): React.ReactNode {
	const fullTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;

	return (
		<Helmet>
			<title>{fullTitle}</title>
			<meta name="description" content={description} />
			{noIndex && <meta name="robots" content="noindex, nofollow" />}
			{canonical && <link rel="canonical" href={canonical} />}

			<meta property="og:type" content="website" />
			<meta property="og:site_name" content={SITE_NAME} />
			<meta property="og:title" content={fullTitle} />
			<meta property="og:description" content={description} />
			{canonical && <meta property="og:url" content={canonical} />}
			<meta property="og:image" content={OG_IMAGE} />

			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={fullTitle} />
			<meta name="twitter:description" content={description} />
			<meta name="twitter:image" content={OG_IMAGE} />
		</Helmet>
	);
}
