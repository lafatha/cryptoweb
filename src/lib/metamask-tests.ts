/**
 * Test file for MetaMask functionality
 * This file can be run in the browser console to test MetaMask integration
 */

// Test MetaMask detection
export function testMetaMaskDetection() {
  console.log('🧪 Testing MetaMask Detection...')
  
  const hasEthereum = typeof window.ethereum !== 'undefined'
  const isMetaMaskInstalled = hasEthereum && (
    window.ethereum.isMetaMask || 
    window.ethereum.providers?.some((p: any) => p.isMetaMask)
  )
  
  console.log(`✅ window.ethereum exists: ${hasEthereum}`)
  console.log(`✅ MetaMask detected: ${isMetaMaskInstalled}`)
  
  if (isMetaMaskInstalled) {
    console.log('✅ MetaMask is properly detected')
  } else {
    console.log('❌ MetaMask not detected')
  }
  
  return isMetaMaskInstalled
}

// Test MetaMask connection
export async function testMetaMaskConnection() {
  console.log('🧪 Testing MetaMask Connection...')
  
  if (!window.ethereum) {
    console.log('❌ MetaMask not available')
    return false
  }
  
  try {
    // Check current accounts
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    console.log(`✅ Current accounts: ${accounts.length > 0 ? accounts : 'None'}`)
    
    // Check current chain
    const chainId = await window.ethereum.request({ method: 'eth_chainId' })
    console.log(`✅ Current chain ID: ${chainId}`)
    
    return accounts.length > 0
  } catch (error) {
    console.error('❌ Error checking MetaMask connection:', error)
    return false
  }
}

// Test MetaMask request accounts
export async function testMetaMaskRequestAccounts() {
  console.log('🧪 Testing MetaMask Account Request...')
  
  if (!window.ethereum) {
    console.log('❌ MetaMask not available')
    return false
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
    console.log(`✅ Requested accounts: ${accounts}`)
    return accounts.length > 0
  } catch (error: any) {
    if (error.code === 4001) {
      console.log('ℹ️ User rejected the request')
    } else {
      console.error('❌ Error requesting accounts:', error)
    }
    return false
  }
}

// Test MetaMask network switching
export async function testMetaMaskNetworkSwitch(chainId: string) {
  console.log(`🧪 Testing Network Switch to ${chainId}...`)
  
  if (!window.ethereum) {
    console.log('❌ MetaMask not available')
    return false
  }
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    })
    console.log(`✅ Successfully switched to chain ${chainId}`)
    return true
  } catch (error: any) {
    if (error.code === 4902) {
      console.log(`ℹ️ Chain ${chainId} not added to MetaMask`)
    } else if (error.code === 4001) {
      console.log('ℹ️ User rejected network switch')
    } else {
      console.error('❌ Error switching network:', error)
    }
    return false
  }
}

// Test MetaMask event listeners
export function testMetaMaskEventListeners() {
  console.log('🧪 Testing MetaMask Event Listeners...')
  
  if (!window.ethereum) {
    console.log('❌ MetaMask not available')
    return
  }
  
  // Test accounts changed event
  const handleAccountsChanged = (accounts: string[]) => {
    console.log('🎉 Accounts changed event:', accounts)
  }
  
  // Test chain changed event
  const handleChainChanged = (chainId: string) => {
    console.log('🎉 Chain changed event:', chainId)
  }
  
  // Test disconnect event
  const handleDisconnect = (error: any) => {
    console.log('🎉 Disconnect event:', error)
  }
  
  window.ethereum.on('accountsChanged', handleAccountsChanged)
  window.ethereum.on('chainChanged', handleChainChanged)
  window.ethereum.on('disconnect', handleDisconnect)
  
  console.log('✅ Event listeners attached')
  
  // Return cleanup function
  return () => {
    window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
    window.ethereum.removeListener('chainChanged', handleChainChanged)
    window.ethereum.removeListener('disconnect', handleDisconnect)
    console.log('✅ Event listeners removed')
  }
}

// Run all tests
export async function runAllMetaMaskTests() {
  console.log('🚀 Running all MetaMask tests...')
  
  const detection = testMetaMaskDetection()
  
  if (!detection) {
    console.log('❌ MetaMask not detected, skipping other tests')
    return
  }
  
  const connection = await testMetaMaskConnection()
  console.log(`Connection status: ${connection ? 'Connected' : 'Not connected'}`)
  
  if (!connection) {
    console.log('ℹ️ To test connection, run: testMetaMaskRequestAccounts()')
  }
  
  // Test event listeners
  const cleanup = testMetaMaskEventListeners()
  
  console.log('✅ All tests completed')
  console.log('ℹ️ Event listeners are active. Try changing accounts or networks in MetaMask.')
  console.log('ℹ️ Run cleanup() to remove event listeners when done.')
  
  return cleanup
}

// Utility to check localStorage state
export function checkWalletStorage() {
  console.log('🧪 Checking wallet storage...')
  
  const keys = ['wagmi.connected', 'wagmi.wallet', 'wagmi.cache', 'wagmi.store']
  
  keys.forEach(key => {
    const value = localStorage.getItem(key)
    console.log(`${key}: ${value || 'null'}`)
  })
}

// Utility to clear wallet storage
export function clearWalletStorage() {
  console.log('🧹 Clearing wallet storage...')
  
  const keys = ['wagmi.connected', 'wagmi.wallet', 'wagmi.cache', 'wagmi.store']
  
  keys.forEach(key => {
    localStorage.removeItem(key)
    console.log(`Removed: ${key}`)
  })
  
  console.log('✅ Wallet storage cleared')
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).MetaMaskTests = {
    testMetaMaskDetection,
    testMetaMaskConnection,
    testMetaMaskRequestAccounts,
    testMetaMaskNetworkSwitch,
    testMetaMaskEventListeners,
    runAllMetaMaskTests,
    checkWalletStorage,
    clearWalletStorage,
  }
  
  console.log('🎯 MetaMask tests loaded! Use MetaMaskTests.runAllMetaMaskTests() to start')
}
