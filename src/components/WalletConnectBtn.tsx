'use client'

import { Button } from '@/components/ui/button'

export function WalletConnectBtn() {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('WalletConnect integration coming soon!')
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="w-full rounded-2xl px-6 py-6 h-16 justify-start border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-900"
      variant="outline"
    >
      <span className="text-2xl mr-4">🔗</span>
      <div className="flex-1 text-left">
        <div className="font-semibold text-lg text-black dark:text-white">WalletConnect</div>
        <div className="text-sm text-gray-600 dark:text-gray-400">Scan with wallet to connect</div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
        Coming Soon
      </div>
    </Button>
  )
}
