import { agariResultToString, calculateAgari } from '../agari'
import { codeSyntaxToHand } from '../code'
import { simpleTileToTile } from '../tile'

describe('agari', () => {
  describe('calculateAgari', () => {
    // shorthand for testing
    const calc = (codeSyntax: string) => agariResultToString(calculateAgari(codeSyntaxToHand(codeSyntax).map(simpleTileToTile)))

    test('should return agari if hand length is 0', () => {
      expect(calc('')).toBe('agari: ')
    })

    test('should return tanki if hand length is 1', () => {
      expect(calc('1m')).toBe('tenpai: 1m => <tanki>1m')
    })

    test('should return toitsu if hand length is 2 and is toitsu', () => {
      expect(calc('55p')).toBe('agari: <toitsu>5p5p')
    })

    test('should return tenpai if hand length is 2 and is ryanmen machi', () => {
      expect(calc('23p')).toBe('tenpai: 1p => <ryanmen>2p3p, 4p => <ryanmen>2p3p')
    })

    test('should return noten if hand length is 2 and is invalid', () => {
      expect(calc('14p')).toBe('noten')
      expect(calc('1p1s')).toBe('noten')
    })

    test.each(['135m', '135m246p', '135m246p357s', '135m246p357s135z'])(
      'should return noten if hand length is %s',
      (syntax) => {
        expect(calc(syntax)).toBe('noten')
      }
    )

    test('should return tenpai if hand length is 4 and is tanki', () => {
      expect(calc('1m111s')).toBe('tenpai: 1m => <tanki>1m<koutsu>1s1s1s')
    })

    test('should return tenpai if hand length is 4 and is shabo', () => {
      expect(calc('55m11z')).toBe('tenpai: 5m => <shabo>5m5m<shabo>1z1z, 1z => <shabo>5m5m<shabo>1z1z')
    })

    test('should return noten if hand length is 4 and is pre-kantsu', () => {
      expect(calc('1111s')).toBe('noten')
    })

    test('should return tenpai if hand length is 4 and is nobetan', () => {
      expect(calc('1234m')).toBe('tenpai: 1m => <tanki>1m<shuntsu>2m3m4m, 4m => <tanki>4m<shuntsu>1m2m3m')
    })

    test('should return agari if hand length is 5', () => {
      expect(calc('12344m')).toBe('agari: <toitsu>4m4m<shuntsu>1m2m3m')
    })

    test('should return multiple agari if hand length is 8', () => {
      expect(calc('11123444m')).toBe(
        'agari: <toitsu>4m4m<koutsu>1m1m1m<shuntsu>2m3m4m,<toitsu>1m1m<shuntsu>1m2m3m<koutsu>4m4m4m'
      )
    })

    test('should return noten if hand length is 8 and is invalid', () => {
      expect(calc('11p1234s66z')).toBe('noten')
    })

    test('should return noten if hand length is 8 and is 4 toitsu', () => {
      expect(calc('4466s2244z')).toBe('noten')
    })

    test('should return noten if hand length is 10 and is invalid', () => {
      expect(calc('122355s1166z')).toBe('noten')
    })

    test('should return tenpai if hand length is 13 and is shabo', () => {
      expect(calc('123456789s5566z')).toBe(
        'tenpai: 5z => <shabo>5z5z<shabo>6z6z<shuntsu>1s2s3s<shuntsu>4s5s6s<shuntsu>7s8s9s, 6z => <shabo>5z5z<shabo>6z6z<shuntsu>1s2s3s<shuntsu>4s5s6s<shuntsu>7s8s9s'
      )
    })

    test('should return tenpai if hand length is 13 and is chiitoitsu', () => {
      expect(calc('1122334455667z')).toBe(
        'tenpai: 7z => <tanki>7z<toitsu>1z1z<toitsu>2z2z<toitsu>3z3z<toitsu>4z4z<toitsu>5z5z<toitsu>6z6z'
      )
    })

    test('should return agari if hand length is 14 and is chiitoitsu', () => {
      expect(calc('11223344556677z')).toBe(
        'agari: <toitsu>1z1z<toitsu>2z2z<toitsu>3z3z<toitsu>4z4z<toitsu>5z5z<toitsu>6z6z<toitsu>7z7z'
      )
    })

    test('should return multiple agari if hand length is 14 and is chiitoitsu or ryanpeikou', () => {
      expect(calc('11223344556677m')).toBe(
        'agari: <toitsu>1m1m<toitsu>2m2m<toitsu>3m3m<toitsu>4m4m<toitsu>5m5m<toitsu>6m6m<toitsu>7m7m,<toitsu>7m7m<shuntsu>1m2m3m<shuntsu>1m2m3m<shuntsu>4m5m6m<shuntsu>4m5m6m,<toitsu>4m4m<shuntsu>1m2m3m<shuntsu>1m2m3m<shuntsu>5m6m7m<shuntsu>5m6m7m,<toitsu>1m1m<shuntsu>2m3m4m<shuntsu>2m3m4m<shuntsu>5m6m7m<shuntsu>5m6m7m'
      )
    })

    test('should return multiple agari if hand length is 14 and is isosansyun or sanrenkou', () => {
      expect(calc('11122233355577m')).toBe(
        'agari: <toitsu>7m7m<koutsu>1m1m1m<koutsu>2m2m2m<koutsu>3m3m3m<koutsu>5m5m5m,<toitsu>7m7m<shuntsu>1m2m3m<shuntsu>1m2m3m<shuntsu>1m2m3m<koutsu>5m5m5m'
      )
    })

    test('should return tenpai if hand length is 13 and is pure nine gate', () => {
      expect(calc('1112345678999m')).toBe(
        'tenpai: 1m => <ryanmen>2m3m<toitsu>9m9m<koutsu>1m1m1m<shuntsu>4m5m6m<shuntsu>7m8m9m or <shabo>1m1m<shabo>9m9m<shuntsu>1m2m3m<shuntsu>4m5m6m<shuntsu>7m8m9m, 2m => <tanki>2m<koutsu>1m1m1m<shuntsu>3m4m5m<shuntsu>6m7m8m<koutsu>9m9m9m, 3m => <toitsu>1m1m<ryanmen>4m5m<shuntsu>1m2m3m<shuntsu>6m7m8m<koutsu>9m9m9m or <toitsu>1m1m<penchan>1m2m<shuntsu>3m4m5m<shuntsu>6m7m8m<koutsu>9m9m9m, 4m => <ryanmen>5m6m<toitsu>9m9m<koutsu>1m1m1m<shuntsu>2m3m4m<shuntsu>7m8m9m or <ryanmen>2m3m<toitsu>9m9m<koutsu>1m1m1m<shuntsu>4m5m6m<shuntsu>7m8m9m, 5m => <tanki>5m<koutsu>1m1m1m<shuntsu>2m3m4m<shuntsu>6m7m8m<koutsu>9m9m9m, 6m => <toitsu>1m1m<ryanmen>7m8m<shuntsu>1m2m3m<shuntsu>4m5m6m<koutsu>9m9m9m or <toitsu>1m1m<ryanmen>4m5m<shuntsu>1m2m3m<shuntsu>6m7m8m<koutsu>9m9m9m, 7m => <penchan>8m9m<toitsu>9m9m<koutsu>1m1m1m<shuntsu>2m3m4m<shuntsu>5m6m7m or <ryanmen>5m6m<toitsu>9m9m<koutsu>1m1m1m<shuntsu>2m3m4m<shuntsu>7m8m9m, 8m => <tanki>8m<koutsu>1m1m1m<shuntsu>2m3m4m<shuntsu>5m6m7m<koutsu>9m9m9m, 9m => <shabo>1m1m<shabo>9m9m<shuntsu>1m2m3m<shuntsu>4m5m6m<shuntsu>7m8m9m or <toitsu>1m1m<ryanmen>7m8m<shuntsu>1m2m3m<shuntsu>4m5m6m<koutsu>9m9m9m'
      )
    })

    test('should return agari if hand length is 13 and is kokushi musou', () => {
      expect(calc('19m19p19s1234566z')).toBe(
        'tenpai: 7z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<tanki>7z<toitsu>6z6z'
      )
    })
    test('should return agari if hand length is 13 and is kokushi musou juusanmen', () => {
      expect(calc('19m19p19s1234567z')).toBe(
        'tenpai: 1m => <kokushi>1m<tanki>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 9m => <kokushi>1m<kokushi>9m<tanki>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 1p => <kokushi>1m<kokushi>9m<kokushi>1p<tanki>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 9p => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<tanki>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 1s => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<tanki>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 9s => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<tanki>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 1z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<tanki>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 2z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<tanki>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 3z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<tanki>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z, 4z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<tanki>4z<kokushi>5z<kokushi>6z<kokushi>7z, 5z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<tanki>5z<kokushi>6z<kokushi>7z, 6z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<tanki>6z<kokushi>7z, 7z => <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<kokushi>7z<tanki>7z'
      )
    })
    test('should return agari if hand length is 14 and is kokushi musou', () => {
      expect(calc('19m19p19s12345677z')).toBe(
        'agari: <kokushi>1m<kokushi>9m<kokushi>1p<kokushi>9p<kokushi>1s<kokushi>9s<kokushi>1z<kokushi>2z<kokushi>3z<kokushi>4z<kokushi>5z<kokushi>6z<toitsu>7z7z'
      )
    })
  })
})
