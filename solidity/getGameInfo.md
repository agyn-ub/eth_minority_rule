 # Get info for Game ID 1 (default)                                                                           
  forge script script/GetGameInfo.s.sol:GetGameInfoScript --rpc-url http://localhost:8545                      
                                                                                                               
  # Get info for a specific game                                                                               
  GAME_ID=1 forge script script/GetGameInfo.s.sol:GetGameInfoScript --rpc-url http://localhost:8545            
                                                                                                               
  # Use a different contract address                                                                           
  CONTRACT_ADDRESS=0xYourAddress GAME_ID=1 forge script script/GetGameInfo.s.sol:GetGameInfoScript --rpc-url   
  http://localhost:8545 

    forge script script/DeployFromAccount0.s.sol:DeployFromAccount0Script --rpc-url http://localhost:8545        
  --broadcast 