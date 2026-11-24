import { toast } from 'sonner'
import type { Translate } from '@/i18n/use-translate'
import type { PendingAutomationRunNavigation } from '@/store/slices/ui/ui-slice-contract-core'
import {
  capturedAutomationOwner,
  capturedAutomationOwnerKey,
  type AutomationCapturedOwner
} from '../hosts/automation-captured-owner'
import {
  getAutomationAuthorityTarget,
  getAutomationHostTargetKey
} from '../hosts/automation-host-client'
import type { AutomationListRow } from '../listing/automation-list-row-identity'

export function reportReplacedAutomationRunOwner(t: Translate): void {
  toast.error(
    t(
      'auto.components.automations.AutomationsPage.ownerChanged',
      'Automation moved hosts. Refresh to retry.'
    ),
    { classNames: { title: 'max-sm:text-xs' } }
  )
}

export function resolveAutomationRunLinkRow(
  pending: PendingAutomationRunNavigation,
  rows: readonly AutomationListRow[],
  owners: ReadonlyMap<string, AutomationCapturedOwner>,
  authorityTargetKey: string
) {
  const row = rows.find(
    (candidate) =>
      candidate.automation.id === pending.automationId &&
      (!pending.ownerKey ||
        pending.ownerKey ===
          capturedAutomationOwnerKey(capturedAutomationOwner(owners, candidate.key))) &&
      (!candidate.catalogRef ||
        getAutomationHostTargetKey(getAutomationAuthorityTarget(candidate.catalogRef.authority)) ===
          authorityTargetKey)
  )
  const replacement = pending.rowKey ? owners.get(pending.rowKey) : undefined
  return {
    row,
    ownerReplaced:
      !row &&
      pending.ownerKey &&
      replacement?.owner &&
      capturedAutomationOwnerKey(replacement) !== pending.ownerKey
  }
}
