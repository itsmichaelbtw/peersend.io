import type { ClassValue } from "clsx";

import { useMemo } from "react";

import clsx from "clsx";

interface Props {
  [key: string]: ClassValue[] | ClassValue;
}

type Return<T extends Props> = {
  classNames: {
    [key in keyof T]: string;
  };
  joinCls(...classes: ClassValue[]): string;
};

export function useClsx<T extends Props>(classes: T): Return<T> {
  const classNames = useMemo(() => {
    const clsxClasses: { [key in keyof T]: string } = {} as { [key in keyof T]: string };

    for (const [key, value] of Object.entries(classes)) {
      // @ts-expect-error
      clsxClasses[key] = clsx(value);
    }

    return clsxClasses;
  }, [classes]);

  return {
    classNames: classNames,
    joinCls: clsx
  } as Return<T>;
}
