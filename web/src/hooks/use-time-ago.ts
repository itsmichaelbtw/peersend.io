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

    return enUS.formatDistance(token as any, count, options);
  }
};

function getTimeDistance(timestamp: string | number | Date) {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: customLocale });
}

export function useTimeDistance(timestamp: string | number | Date) {
  const [timeDistance, setTimeDistance] = useState(() => getTimeDistance(timestamp));

  useEffect(() => {
    function update() {
      setTimeDistance(getTimeDistance(timestamp));
    }

    update();
    const interval = setInterval(update, 60 * 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  return timeDistance;
}
