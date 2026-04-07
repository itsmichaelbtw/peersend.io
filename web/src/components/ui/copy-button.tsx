import React, { useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";

type CopyButtonProps = {
	value: string;
	className?: string;
	children?: React.ReactNode;
};

export function CopyButton({ value, className, children }: CopyButtonProps): React.ReactNode {
	const [copied, setCopied] = useState(false);

	function handleCopy(): void {
		void navigator.clipboard.writeText(value).then(() => {
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		});
	}

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="ghost"
					size={children ? "sm" : "icon"}
					className={cn("gap-2", className)}
					onClick={handleCopy}
				>
					{children}
					{copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<p>{copied ? "Copied!" : `Copy ${value}`}</p>
			</TooltipContent>
		</Tooltip>
	);
}
