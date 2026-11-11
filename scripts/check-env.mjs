const required=['NEXT_PUBLIC_SUPABASE_URL','NEXT_PUBLIC_SUPABASE_ANON_KEY','SUPABASE_SERVICE_ROLE_KEY','NEXT_PUBLIC_BASE_URL','STRIPE_SECRET_KEY','STRIPE_WEBHOOK_SECRET','SESSION_SECRET','ADMIN_PASSWORD','ADMIN_SESSION_SECRET','CRON_SECRET'];
const missing=required.filter(key=>!process.env[key]);
for(const key of ['SESSION_SECRET','ADMIN_SESSION_SECRET'])if(process.env[key] && process.env[key].length<32)missing.push(`${key} (at least 32 characters)`);
if(missing.length){console.error(`Missing or invalid configuration: ${missing.join(', ')}`);process.exitCode=1;}else console.log('Required configuration is present. Values were not printed.');
