// A publish that activates nothing emits nothing for a tab already listed, so it must not rename
// that tab's showing behind the client's back: its "x" would then answer "superseded".
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { hostTestState } from '../../../native-chat/agent-session-wire/host/testing/structured-agent-session-host.test-fixture'
import { setStructuredAgentSessionHost } from '../../../native-chat/agent-session-wire/host/structured-agent-session-registry'
import { admitStructuredSessionTabPublication } from './structured-session-tab-publication'

const SESSION = 'session-reused'

beforeEach(() => {
  const { host } = hostTestState()
  setStructuredAgentSessionHost(host)
})

afterEach(() => {
  setStructuredAgentSessionHost(null)
  vi.restoreAllMocks()
})

describe('publishing a chat tab', () => {
  it('keeps the showing when it activates nothing, and renews it when it activates', async () => {
    const { host } = hostTestState()
    const write = vi.spyOn(host, 'setSessionTabVisibility').mockResolvedValue()

    await admitStructuredSessionTabPublication(
      { sessionId: SESSION, activate: false },
      async () => {}
    )
    await admitStructuredSessionTabPublication(
      { sessionId: SESSION, activate: true },
      async () => {}
    )

    expect(write.mock.calls.map(([, , , options]) => options?.keepShowing)).toEqual([
      true,
      undefined
    ])
  })
})
