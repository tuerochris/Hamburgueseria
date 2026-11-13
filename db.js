// Capa de datos compartida (Supabase). Si config.js no está completo, DB.ok = false y las páginas funcionan en modo demo.
const DB = (() => {
  const C = window.HAM || {};
  const ok = !!(C.SUPABASE_URL && C.SUPABASE_KEY && !/PEGA/.test(C.SUPABASE_URL + C.SUPABASE_KEY) && window.supabase);
  const sb = ok ? window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_KEY) : null;
  const must = r => { if (r.error) throw r.error; return r.data; };
  const rnd = () => Math.random().toString(36).slice(2);
  const api = {
    ok,
    newOrder: async o => must(await sb.from('orders').insert(o).select().single()),
    setOrder: async (id, p) => must(await sb.from('orders').update({ ...p, ...(p.st ? { st_at: new Date().toISOString() } : {}) }).eq('id', id).select().single()),
    orders: async sts => must(await sb.from('orders').select('*').in('st', sts).gte('created_at', new Date(Date.now() - 864e5).toISOString()).order('st_at')),
    watch: (cb, filter) => sb.channel('o' + rnd()).on('postgres_changes', { event: '*', schema: 'public', table: 'orders', ...(filter ? { filter } : {}) }, p => cb(p.new)).subscribe(),
    customer: async code => { const r = await sb.from('customers').select('*').eq('code', code).maybeSingle(); if (r.error) throw r.error; return r.data; },
    newCustomer: c => sb.from('customers').insert(c).select().single(),      // devuelve {data, error}
    setStamps: async (code, n) => must(await sb.from('customers').update({ stamps: n }).eq('code', code).select().single()),
    addStamp: async code => { const c = await api.customer(code); if (!c) return null; return c.stamps >= 10 ? c : api.setStamps(code, c.stamps + 1); },
    watchCustomer: (code, cb) => sb.channel('c' + rnd()).on('postgres_changes', { event: '*', schema: 'public', table: 'customers', filter: `code=eq.${code}` }, p => cb(p.new)).subscribe()
  };
  return api;
})();
