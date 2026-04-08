import React from "react";

import { Outlet, ScrollRestoration } from "react-router";

export function RootLayout(): React.ReactNode {
	return (
		<React.Fragment>
			<ScrollRestoration />
			<Outlet />
		</React.Fragment>
	);
}
