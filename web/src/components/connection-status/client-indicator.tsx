import React from "react";

import { UsersRoundIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
	clientsConnected: number;
	maximumClients: number;
}

export function ClientIndicator({ clientsConnected, maximumClients }: Props): React.ReactNode {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex flex-row items-center gap-x-1">
					<UsersRoundIcon size={16} />
					<span className="text-sm font-normal">Peers</span>
				</div>
				<span className="text-sm font-light">
					{clientsConnected}/{maximumClients}
				</span>
			</div>
			<Progress className="h-2" value={(clientsConnected * 100) / maximumClients} />
		</div>
	);
}
