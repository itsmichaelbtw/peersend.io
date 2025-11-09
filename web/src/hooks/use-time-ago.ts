import type { Locale } from "date-fns";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { enUS } from "date-fns/locale";

const customLocale: Locale = {
	...enUS,
	formatDistance: (token, count, options) => {
		if (token === "lessThanXMinutes") {
			return "now";
		}

		return enUS.formatDistance(token, count, options);
	}
};

function getTimeDistance(timestamp: string | number | Date): string {
	return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: customLocale });
}

export function useTimeDistance(timestamp: string | number | Date): string {
	const [timeDistance, setTimeDistance] = useState(() => getTimeDistance(timestamp));

	useEffect(() => {
		function update(): void {
			setTimeDistance(getTimeDistance(timestamp));
		}

		update();
		const interval = setInterval(update, 60 * 1000);

		return (): void => clearInterval(interval);
	}, [timestamp]);

	return timeDistance;
}
