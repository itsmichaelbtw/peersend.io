import type { ClassValue } from "clsx";

import clsx from "clsx";

import { computed, reactive } from "vue";

interface Props {
  [key: string]: ClassValue[] | ClassValue;
}

export function useClsx<T extends Props>(classes: T) {
  const classNames = reactive<{ [key in keyof T]: string }>({} as { [key in keyof T]: string });

  Object.entries(classes).forEach(([key, value]) => {
    // @ts-expect-error
    classNames[key as keyof T] = clsx(value);
  });

  const joinCls = (...classes: ClassValue[]): string => {
    return clsx(classes);
  };

  return {
    classNames: computed(() => classNames),
    joinCls
  };
}
