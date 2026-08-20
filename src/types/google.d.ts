interface GoogleAccountsId {
  initialize(config: {
    client_id: string
    callback: (response: { credential: string }) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }): void
  renderButton(
    element: HTMLElement,
    config: {
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'small' | 'medium' | 'large'
      width?: string | number
      text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signup'
      shape?: 'rectangular' | 'pill' | 'circle' | 'square'
      logo_alignment?: 'left' | 'center'
      locale?: string
    }
  ): void
  prompt(): void
}

interface GoogleAccounts {
  id: GoogleAccountsId
}

interface Window {
  google?: {
    accounts: GoogleAccounts
  }
}
