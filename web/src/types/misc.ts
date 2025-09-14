export type WithNullable<T> = T | null | undefined | void;

type WithBaseGeneric = "required" | "optional";

/**
 * Adds children to a component. By default, children are required.
 */
export type WithChildren<
  T extends WithBaseGeneric = "required",
  R = React.ReactNode
> = T extends "required" ? { children: R } : { children?: R };

export type RecursivePartial<T> = {
  [P in keyof T]?: T[P] extends object ? RecursivePartial<T[P]> : T[P];
};
