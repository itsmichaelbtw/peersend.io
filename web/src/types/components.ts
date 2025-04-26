import type { RouteLocationRaw } from "vue-router";
import type { WithNullable } from "./misc";

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

    export interface StatInformation {
      title: string;
      stat?: string;
    }

    export interface ConnectionUpgradeDialog {
      visible: boolean;
      onChange(value: boolean): void;
    }
  }

  export interface BackNavigation {
    text?: string;
    to?: RouteLocationRaw;
  }

  export interface CopyToClipboard {
    value: WithNullable<string>;
  }
}
