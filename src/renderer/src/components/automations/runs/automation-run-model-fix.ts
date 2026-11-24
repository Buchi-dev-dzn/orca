import { toast } from 'sonner'
import { translate } from '@/i18n/i18n'
import type { Automation } from '../../../../../shared/automations/automation-definition'
import type { AutomationModelRecoveryResult } from '../../../../../shared/automations/history/automation-model-recovery'
import type { AutomationRun } from '../../../../../shared/automations/history/automation-run'
import type { Bot } from '../../../../../shared/bot-types'
import { botAutomationSetup } from '../../../../../shared/bots/bot-agent-setup'

export type AutomationRunModelOption = { id: string; label: string }

export function automationRunModelFix({
  run,
  automation,
  bot,
  canRerun
}: {
  run: Pick<AutomationRun, 'status' | 'errorCode' | 'errorParams'>
  automation: Pick<Automation, 'bot'> | null
  bot: Pick<Bot, 'agent' | 'launch'> | null
  canRerun: boolean
}) {
  const target = automation?.bot
  if (
    run.status !== 'dispatch_failed' ||
    run.errorCode !== 'agentModelUnavailable' ||
    !canRerun ||
    !target ||
    !bot ||
    target.runsIn !== 'new'
  ) {
    return null
  }
  const setup = botAutomationSetup(target, bot)
  if (run.errorParams?.agent !== setup.agent) {
    return null
  }
  return {
    agent: setup.agent,
    currentModel: setup.launch?.model,
    failureParams: run.errorParams
  }
}

export function showAutomationModelRecoveryResult(
  result: AutomationModelRecoveryResult,
  model: string,
  openRun?: () => void
): void {
  switch (result.status) {
    case 'changed':
      toast.error(
        translate(
          'automations.runModelFix.changed',
          "This automation changed, so the model wasn't saved. Use Edit to change it."
        )
      )
      break
    case 'busy':
      toast(translate('automations.runModelFix.busy', 'A model change is already in progress.'))
      break
    case 'unsupported':
      toast.error(
        translate('automations.runModelFix.unsupported', 'Update Orca on this host to retry here.')
      )
      break
    case 'unconfirmed':
      toast.error(
        translate(
          'automations.runModelFix.unconfirmed',
          "Couldn't confirm the model change. Check the automation before rerunning."
        )
      )
      break
    case 'saved':
      toast.error(
        result.rerun === 'skipped'
          ? translate(
              'automations.runModelFix.rerunFailed',
              'Model set to {{model}} for this automation, but the rerun didn’t start.',
              { model }
            )
          : translate(
              'automations.runModelFix.rerunUnconfirmed',
              'Model set to {{model}}. Check the run history to see if the rerun started.',
              { model }
            )
      )
      break
    case 'queued':
      toast(
        result.newerModel
          ? translate(
              'automations.runModelFix.queuedWithNewerModel',
              "Run queued with the automation's latest model."
            )
          : translate(
              'automations.runModelFix.saved',
              'Model set to {{model}} for this automation.',
              {
                model
              }
            ),
        openRun && {
          duration: Infinity,
          closeButton: true,
          action: {
            label: translate(
              'auto.components.sidebar.WorktreeCardMeta.openAutomationRun',
              'Open run'
            ),
            onClick: (event) => {
              event.preventDefault()
              openRun()
            }
          }
        }
      )
      break
  }
}
