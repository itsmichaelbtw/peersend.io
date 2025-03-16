export namespace FormValues {
  export interface JoinSession {
    sessionCode: string;
  }
}

export interface FormErrors {
  [key: string]: { message: string } | undefined;
}
