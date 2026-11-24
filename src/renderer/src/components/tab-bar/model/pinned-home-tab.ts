import type { Bot } from '../../../../../shared/bot-types'
import { isBotHomeTab } from '../../../../../shared/bots/bot-home-tab'
import type { TabBarItem } from './tab-bar-item-model'

/** The bot's Home when it leads the order; only then does it leave the scroller for a fixed slot. */
export function findPinnedHomeTabId(
  orderedItems: readonly TabBarItem[],
  homeBot: Pick<Bot, 'chatSessionId'> | null
): string | null {
  const first = orderedItems[0]
  // Why only when first: a host that doesn't keep Home first leaves it in the strip where it sits.
  return first?.type === 'agent-session' && isBotHomeTab(first.data, homeBot) ? first.id : null
}

/** The scroller's ids: every tab but the pinned Home. */
export function stripSortableIdsWithoutPinnedHome(
  sortableIds: string[],
  pinnedHomeId: string | null
): string[] {
  return pinnedHomeId === null ? sortableIds : sortableIds.filter((id) => id !== pinnedHomeId)
}
