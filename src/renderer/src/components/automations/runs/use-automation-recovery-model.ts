import { useEffect, useState } from 'react'
import { subscribeHostAgentLaunchSettings } from '@/runtime/agent-launch-settings/agent-launch-settings-transport'
import type { AutomationOwnerRef } from '../../../../../shared/automations/ownership/automation-owner-ref'
import type { GlobalSettings } from '../../../../../shared/settings/global-settings-types'
import { readAutomationRecoveryModelForOwner } from '../hosts/automation-model-recovery-client'

/** A Settings model is inherited from the owner, even while the client is on another host. */
export function useAutomationRecoveryModel(
  owner: AutomationOwnerRef | null,
  id: string | undefined,
  runKey: string | null,
  desktopChoices: GlobalSettings['agentLaunchChoices']
) {
  const [answer, setAnswer] = useState<{ runKey: string; model: string | null } | null>(null)
  useEffect(() => {
    if (!owner || !id || !runKey) {
      return
    }
    let request = 0
    const refresh = () => {
      const token = ++request
      void readAutomationRecoveryModelForOwner(owner, id)
        .catch(() => null)
        .then((model) => {
          if (request === token) {
            setAnswer({ runKey, model })
          }
        })
    }
    refresh()
    const authority = owner.authority
    const unsubscribe =
      authority.kind === 'runtime'
        ? subscribeHostAgentLaunchSettings(({ environmentId }) => {
            if (environmentId === authority.environmentId) {
              refresh()
            }
          })
        : undefined
    return () => {
      request++
      unsubscribe?.()
    }
  }, [owner, id, runKey, desktopChoices])
  return owner && answer?.runKey === runKey ? answer.model : undefined
}
