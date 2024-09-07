import riichiYakuValidators from '@ima/server/helpers/yaku/validators/riichi'
import localYakuValidators from '@ima/server/helpers/yaku/validators/local'
import type { GameState } from '@ima/server/types/game'

export default (state: GameState) =>
  state.rule.localYaku ? [...riichiYakuValidators, ...localYakuValidators] : [...riichiYakuValidators]
