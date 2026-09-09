import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vargbxztaxpmrttnrtuf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZhcmdieHp0YXhwbXJ0dG5ydHVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY4MTM4NjMsImV4cCI6MjA2MjM4OTg2M30.6-DQWyMk7vllF96oeZ8Uqpy3rrdYACPlu31-asTzuLM";

export const supabase = createClient(supabaseUrl, supabaseKey);
