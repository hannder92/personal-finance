export const DASHBOARD_TIER2_SESSION_KEY = 'pf_dashboard_tier2_expanded'

export interface Tier2StateInput {
  isDesktop: boolean
  hasIncome: boolean
  isExpanded: boolean
}

export interface Tier2State {
  tier2Visible: boolean
  canToggle: boolean
}

export function readTier2Expanded(session: Storage | null): boolean {
  if (!session) return false
  return session.getItem(DASHBOARD_TIER2_SESSION_KEY) === 'true'
}

export function writeTier2Expanded(session: Storage | null, expanded: boolean): void {
  if (!session) return
  session.setItem(DASHBOARD_TIER2_SESSION_KEY, expanded ? 'true' : 'false')
}

export function computeTier2State(input: Tier2StateInput): Tier2State {
  const { isDesktop, hasIncome, isExpanded } = input

  if (!hasIncome) {
    return { tier2Visible: false, canToggle: false }
  }

  if (isDesktop) {
    return { tier2Visible: true, canToggle: false }
  }

  return {
    tier2Visible: isExpanded,
    canToggle: true,
  }
}
