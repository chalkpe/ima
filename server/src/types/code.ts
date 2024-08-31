export type SyuupaiCodeSuffix = 'm' | 'p' | 's'
export type SyuuhaiCodeNumber = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'

export type ZihaiCodeSuffix = 'z'
export type ZihaiCodeNumber = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type CodeSuffix = SyuupaiCodeSuffix | ZihaiCodeSuffix
export type CodeNumber = SyuuhaiCodeNumber | ZihaiCodeNumber

export type Code = `${SyuuhaiCodeNumber}${SyuupaiCodeSuffix}` | `${ZihaiCodeNumber}${ZihaiCodeSuffix}`
