import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = (await readFile(new URL('../src/utils/supabase.js', import.meta.url), 'utf8'))
  .replace("'@supabase/supabase-js'", JSON.stringify(import.meta.resolve('@supabase/supabase-js')));
async function load(env) {
  return import(`data:text/javascript;base64,${Buffer.from(source.replaceAll('import.meta.env', JSON.stringify(env))).toString('base64')}`);
}
test('missing configuration gives an actionable error', async () => {
  const api = await load({});
  await assert.rejects(api.readSiteConfig(), /Configure VITE_SUPABASE_URL/);
});
test('SDK reads singleton content, checks membership, writes and propagates permission failures', async () => {
  const api = await load({ VITE_SUPABASE_URL: 'https://example.supabase.co', VITE_SUPABASE_PUBLISHABLE_KEY: 'test-public-key' });
  const originalFetch = globalThis.fetch;
  let response = [];
  let status = 200;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return new Response(status === 201 ? null : JSON.stringify(response), { status, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    assert.equal(await api.readSiteConfig(), null);
    response = [{ content: { badge: 'Saved content' } }];
    assert.deepEqual(await api.readSiteConfig(), { badge: 'Saved content' });
    assert.match(calls.at(-1).url, /id=eq.main/);
    assert.equal(await api.isSiteAdmin(null), false);
    response = [];
    assert.equal(await api.isSiteAdmin('user-1'), false);
    response = [{ user_id: 'user-1' }];
    assert.equal(await api.isSiteAdmin('user-1'), true);
    status = 201;
    await api.writeSiteConfig({ badge: 'New content' });
    assert.equal(calls.at(-1).options.method, 'POST');
    assert.deepEqual(JSON.parse(calls.at(-1).options.body), { id: 'main', content: { badge: 'New content' } });
    status = 403;
    response = { code: '42501', message: 'row-level security violation' };
    await assert.rejects(api.writeSiteConfig({}), { code: '42501', message: 'row-level security violation' });
    await assert.rejects(api.readSiteConfig(), { code: '42501', message: 'row-level security violation' });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
