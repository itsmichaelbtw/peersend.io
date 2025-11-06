import React from "react";

export type WithNullable<T> = T | null;

type WithBaseGeneric = "required" | "optional";

/**
 * A type that represents a React component that has children. The children propr
 * can be defined as required or optional using the T generic.
 *
 * @example
 * type MyComponentProps = WithChildren<"required">;
 *
 */
export type WithChildren<
	T extends WithBaseGeneric = "required",
	R = React.ReactNode
> = T extends "required" ? { children: R } : { children?: R };

export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object
			? RecursivePartial<T[P]>
			: T[P];
};

/**
 * Provide an interface and a list of keys to make those keys optional.
 *
 * @example
 * interface User {
 *  name: string;
 *  age: number;
 * }
 *
 * type PartialKeysUser = PartialKeys<User, "name">;
 */
export type PartialKeys<T, K extends keyof T> = Partial<Pick<T, K>> & Required<Omit<T, K>>;

/**
 * Provide an interface and a list of keys to make those keys required.
 *
 * @example
 * interface User {
 *  name?: string;
 *  age: number;
 * }
 *
 * type RequiredKeysUser = RequiredKeys<User, "name">;
 */
export type RequiredKeys<T, K extends keyof T> = Required<Pick<T, K>> & Partial<Omit<T, K>>;

/**
 * A generic function type.
 */
export type FunctionType<T = unknown> = (...args: unknown[]) => T;

/**
 * A generic async function type.
 */
export type AsyncFunctionType<T = unknown> = (...args: unknown[]) => Promise<T>;

/**
 * Get the return type of a function.
 *
 * @example
 * type MyFunctionReturnType = ReturnType<typeof myFunction>;
 */
export type ReturnType<T extends FunctionType<K>, K = unknown> = T extends (
	...args: unknown[]
) => infer R
	? R
	: never;

/**
 * When "compilerOptions.strictNullChecks" is enabled, this is convenient to use
 * when you want to allow null or undefined values.
 *
 * @example
 * type MyType = WithStrictChecks<string>;
 *
 * const myValue: MyType = null;
 */
export type WithStrictChecks<T> = T | null | undefined;

/**
 * Converts all properties of an object to be non-nullable.
 *
 * @example
 * type MyType = NonNullabeObject<{ a: string | null, b: number | undefined }>;
 *
 * const myValue: MyType = { a: "hello", b: 10 };
 */
export type NonNullabeObject<T> = T extends object ? { [K in keyof T]-?: NonNullable<T[K]> } : T;

/**
 * Represents a flexible string type that can be used to express different
 * string shapes or constraints.
 *
 * @example
 * type MyType = "a" | "b" | "c" | FlexibleString;
 *
 * function myFunction(value: MyType) {
 *  ...
 * }
 *
 * myFunction("d"); // No type error
 */
export type FlexibleString = string & {};

/**
 * Creates a new type by excluding properties from T that are also present in U.
 * This type is useful for creating types that represent the difference between two types.
 * @example
 * type MutableUser = Without<User, Readonly<User>>;
 */
export type Without<T, U> = {
	[P in Exclude<keyof T, keyof U>]?: never;
};

/**
 * Creates a new type where all properties of T are readonly. This type is useful
 * for ensuring that objects are not mutated unintentionally.
 * @example
 * // Create a readonly version of a user object.
 * type ReadonlyUser = ReadonlyObject<User>;
 */
export type ReadonlyObject<T> = {
	readonly [P in keyof T]: T[P];
};

/**
 * A type that represents all primitive types in TypeScript.
 */
export type Primitive = string | number | boolean | null | undefined;
