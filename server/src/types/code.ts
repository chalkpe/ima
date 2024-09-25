export type SyuupaiCodeSuffix = 'm' | 'p' | 's'
export type SyuuhaiCodeNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type ZihaiCodeSuffix = 'z'
export type ZihaiCodeNumber = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type CodeSuffix = SyuupaiCodeSuffix | ZihaiCodeSuffix
export type CodeNumber = SyuuhaiCodeNumber | ZihaiCodeNumber

export type Code = `${SyuuhaiCodeNumber}${SyuupaiCodeSuffix}` | `${ZihaiCodeNumber}${ZihaiCodeSuffix}`

type ValidateCode<N extends string, S extends string> = [N] extends [never]
  ? false
  : N extends Exclude<CodeNumber, SyuuhaiCodeNumber>
    ? S extends ZihaiCodeSuffix
      ? true
      : false
    : N extends Exclude<CodeNumber, ZihaiCodeNumber>
      ? S extends SyuupaiCodeSuffix
        ? true
        : false
      : N extends CodeNumber
        ? S extends CodeSuffix
          ? true
          : false
        : false

type VerifyCodeSyntax<T extends string, N extends string = never> = T extends `${infer F}${infer R}`
  ? F extends CodeNumber
    ? VerifyCodeSyntax<R, N | F>
    : F extends CodeSuffix
      ? ValidateCode<N, F> extends true
        ? R extends ''
          ? string
          : VerifyCodeSyntax<R, never>
        : never
      : never
  : never

export type CodeSyntax<T extends string> = VerifyCodeSyntax<T>
