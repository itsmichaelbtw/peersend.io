import React from "react";

import { Outlet } from "react-router";

export function MainLayout(): React.ReactNode {
	return (
		<React.Fragment>
			<header className="border-b border-gray-200">
				<div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
					<div>peerseond.io</div>
				</div>
			</header>
			<Outlet />
		</React.Fragment>
	);
}
