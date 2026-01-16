# Anvil Local Development Guide

## Run Anvil with State Persistence

Start Anvil with state saving:

```bash
anvil --state .anvil-state.json
```

This will:
- Start a local Ethereum node at `http://localhost:8545`
- Chain ID: `31337`
- Save the blockchain state when you stop Anvil (Ctrl+C)
- Automatically load the state file when you restart

**Restart with existing state:**
```bash
anvil --state .anvil-state.json
```

Anvil will automatically detect and load the previous state.

## Clear State (Start Fresh)

To start with a clean blockchain:

```bash
rm .anvil-state.json
anvil --state .anvil-state.json
```

Or run without state persistence:

```bash
anvil
```

## Add Anvil to MetaMask

1. Open MetaMask
2. Click "Add Network" (or "Add a network manually")
3. Enter network details:
   - **Network Name:** `Localhost`
   - **RPC URL:** `http://localhost:8545`
   - **Chain ID:** `31337`
   - **Currency Symbol:** `ETH`
4. Click "Save"
5. Import a test account using one of Anvil's private keys (shown when Anvil starts)
6. You'll have 10,000 ETH instantly!

**Default Test Account:**
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```
