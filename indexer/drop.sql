 -- Drop all Ponder tables (your data)                                                                                                
  DROP TABLE IF EXISTS games, players, votes, commits, rounds, winners CASCADE;                                                        
                                                                                                                                       
  -- Drop Ponder internal tables                                                                                                       
  DROP TABLE IF EXISTS _ponder_checkpoint, _ponder_meta CASCADE;                                                                       
                                                                                                                                       
  -- Drop everything in ponder_sync schema (cache)                                                                                     
  DROP SCHEMA IF EXISTS ponder_sync CASCADE;    