# Deploy Contract from Account 0

## Deploy to Anvil

```bash
forge script script/DeployFromAccount0.s.sol:DeployFromAccount0Script --rpc-url http://localhost:8545 --broadcast
```

## Account 0 Details

- Address: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`
- Private Key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

## Latest Deployed Contract

Address: `0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512`

```bash
  forge script script/Deploy.s.sol:DeployScript --rpc-url base_sepolia --broadcast
```



== Return ==
0: contract MinorityRuleGame 0x1DB2301C7a31856a145aB1046a0aCB1AE5366d1E

== Logs ==
  Deploying MinorityRuleGame...
  Platform Fee Recipient: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
  MinorityRuleGame deployed to: 0x1DB2301C7a31856a145aB1046a0aCB1AE5366d1E
  Platform Fee: 2%
  Next Game ID: 1

## Setting up 1 EVM.

==========================

Chain 84532

Estimated gas price: 0.0014 gwei

Estimated total gas used for script: 1978414

Estimated amount required: 0.0000027697796 ETH

==========================

##### base-sepolia
✅  [Success] Hash: 0x0bf328d96d8af9f25dac0ede62c860d0bf50d990cff08ea735fbcc5f9df0b8cd
Contract Address: 0x1DB2301C7a31856a145aB1046a0aCB1AE5366d1E
Block: 37222344
Paid: 0.0000018262284 ETH (1521857 gas * 0.0012 gwei)

✅ Sequence #1 on base-sepolia | Total Paid: 0.0000018262284 ETH (1521857 gas * avg 0.0012 gwei)
                                                                                    

==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.

Transactions saved to: /Users/angus/Desktop/projects/Base/eth_minority_rule/solidity/broadcast/Deploy.s.sol/84532/run-latest.json

Sensitive values saved to: /Users/angus/Desktop/projects/Base/eth_minority_rule/solidity/cache/Deploy.s.sol/84532/run-latest.json