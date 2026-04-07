import React from "react";

interface Props {
	title: string;
	stat: string | number | React.ReactNode;
}

export function InfoStatistic({ title, stat }: Props): React.ReactNode {
	return (
		<div className="flex flex-row items-center justify-between border-b pb-2 text-sm">
			<p className="text-muted-foreground">{title}</p>
			{typeof stat === "string" || typeof stat === "number" ? (
				<p>{stat}</p>
			) : (
				stat
			)}
		</div>
	);
}
