import {supabase} from '@/lib/supabase';
export async function designerFetch(url:string,init:RequestInit={}){const {data}=await supabase.auth.getSession();return fetch(url,{...init,headers:{...init.headers,Authorization:`Bearer ${data.session?.access_token}`}});}
