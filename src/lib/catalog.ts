export async function getCatalog():Promise<{designers:any[];products:any[]}>{const r=await fetch('/api/catalog');const d=await r.json();if(!r.ok)throw new Error(d.error);return d;}
