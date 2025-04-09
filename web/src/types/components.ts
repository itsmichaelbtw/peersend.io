import type { RouteLocationRaw } from "vue-router";

export namespace ComponentTypes {
  export namespace SessionProps {
    export interface Deck {
      heading: string;
      backNavigation?: BackNavigation["to"];
      alternative?: {
        text: string;
        link: string;
        linkText: string;
      };
    }

    export interface ActivityLog {
      logs: {
        date: string;
        title: string;
        description: string;
      }[];
    }
  }

  export interface BackNavigation {
    text: string;
    to?: RouteLocationRaw;
  }
}
