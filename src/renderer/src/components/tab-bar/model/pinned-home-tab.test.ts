import { describe, expect, it } from 'vitest'
import type { Tab } from '../../../../../shared/workspace-layout/tab-groups/tab-types'
import type { TabBarItem } from './tab-bar-item-model'
import { findPinnedHomeTabId, stripSortableIdsWithoutPinnedHome } from './pinned-home-tab'

const homeBot = { chatSessionId: 'home-chat' }

function chatItem(id: string, entityId: string): TabBarItem {
  return {
    type: 'agent-session',
    id,
    unifiedTabId: id,
    isPinned: false,
    data: { id, entityId, contentType: 'agent-session' } as Tab & { contentType: 'agent-session' }
  } as TabBarItem
}

describe('findPinnedHomeTabId', () => {
  it("takes the bot's Home out of the scroller when it leads the order", () => {
    const items = [chatItem('home', 'home-chat'), chatItem('side', 'side-chat')]
    expect(findPinnedHomeTabId(items, homeBot)).toBe('home')
  })

  it('leaves Home in the strip when a host keeps it elsewhere in the order', () => {
    const items = [chatItem('side', 'side-chat'), chatItem('home', 'home-chat')]
    expect(findPinnedHomeTabId(items, homeBot)).toBeNull()
  })

  it('pins nothing outside a bot page or with no tabs', () => {
    expect(findPinnedHomeTabId([chatItem('home', 'home-chat')], null)).toBeNull()
    expect(findPinnedHomeTabId([], homeBot)).toBeNull()
  })
})

describe('stripSortableIdsWithoutPinnedHome', () => {
  it('drops only the pinned Home from the scroller ids', () => {
    expect(stripSortableIdsWithoutPinnedHome(['home', 'a', 'b'], 'home')).toEqual(['a', 'b'])
  })

  it('keeps the same array when nothing is pinned', () => {
    const ids = ['a', 'b']
    expect(stripSortableIdsWithoutPinnedHome(ids, null)).toBe(ids)
  })
})
