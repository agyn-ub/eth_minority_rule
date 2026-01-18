# Reset without confirmation prompt                                                                                                  
  supabase db reset --yes                                                                                                              
                                                                                                                                       
  # Reset without running seed data                                                                                                    
  supabase db reset --no-seed                                                                                                          
                                                                                                                                       
  # Reset only up to last 5 migrations                                                                                                 
  supabase db reset --last 5                                                                                                           
                               