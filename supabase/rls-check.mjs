// =====================================================================
// Permission test for the staff portal database (run against a DEV project).
//
// It logs in as: a public visitor, the test accountant and the test admin,
// then tries allowed AND forbidden actions directly against Supabase,
// skipping the React screens - exactly what an attacker would do.
//
// SETUP: add these lines to your local .env (never commit them):
//   TEST_ADMIN_EMAIL=...
//   TEST_ADMIN_PASSWORD=...
//   TEST_ACCOUNTANT_EMAIL=...
//   TEST_ACCOUNTANT_PASSWORD=...
//
// RUN:   node --env-file=.env supabase/rls-check.mjs
//
// NOTE: it creates test records marked "RLS TEST". Payments can never be
// deleted (by design), so only run this on a development project.
// =====================================================================

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;
const need = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'TEST_ADMIN_EMAIL', 'TEST_ADMIN_PASSWORD', 'TEST_ACCOUNTANT_EMAIL', 'TEST_ACCOUNTANT_PASSWORD'];
const missing = need.filter((name) => !process.env[name]);
if (missing.length) {
  console.error('Missing in .env: ' + missing.join(', '));
  process.exit(1);
}

const newClient = () => createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } });
const visitor = newClient();
const admin = newClient();
const accountant = newClient();

let passed = 0;
let failed = 0;
const check = (name, ok, detail = '') => {
  if (ok) passed++; else failed++;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok ? '' : `   -> ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`}`);
};
const section = (title) => console.log(`\n=== ${title} ===`);
// "Blocked" = an error, or the database silently changed/returned nothing
const blocked = ({ error, data }) => Boolean(error) || !data || data.length === 0;

const stamp = Date.now();
const ref = (label) => `RLS-${label}-${stamp}`;

// ---------------------------------------------------------------------
section('Logins');
{
  const a = await admin.auth.signInWithPassword({ email: process.env.TEST_ADMIN_EMAIL, password: process.env.TEST_ADMIN_PASSWORD });
  check('Admin can log in', !a.error, a.error?.message);
  const b = await accountant.auth.signInWithPassword({ email: process.env.TEST_ACCOUNTANT_EMAIL, password: process.env.TEST_ACCOUNTANT_PASSWORD });
  check('Accountant can log in', !b.error, b.error?.message);
  const wrong = await newClient().auth.signInWithPassword({ email: process.env.TEST_ADMIN_EMAIL, password: 'definitely-wrong-password' });
  check('Wrong password is rejected', Boolean(wrong.error));
  const signup = await newClient().auth.signUp({ email: `rls-test-${stamp}@example.com`, password: 'Test-password-123!' });
  check('Public sign-up is disabled', Boolean(signup.error), 'sign-up succeeded - turn off "Allow new users to sign up"');
  if (a.error || b.error) {
    console.log('\nCannot continue without both logins.');
    process.exit(1);
  }
}

const { data: adminProfile } = await admin.from('profiles').select('id, role, is_active').eq('id', (await admin.auth.getUser()).data.user.id).single();
const { data: acctProfile } = await accountant.from('profiles').select('id, role, is_active').eq('id', (await accountant.auth.getUser()).data.user.id).single();
check('Admin profile has role "admin"', adminProfile?.role === 'admin' && adminProfile?.is_active, adminProfile);
check('Accountant profile has role "accountant"', acctProfile?.role === 'accountant' && acctProfile?.is_active, acctProfile);

// ---------------------------------------------------------------------
section('Public visitor (not logged in)');
{
  const ok = await visitor.from('enquiries').insert({
    first_name: 'RLS', last_name: 'TEST', email: 'rls@example.com', event_type: 'Wedding', guest_count: 10,
  });
  check('Visitor CAN send an enquiry', !ok.error, ok.error?.message);

  const sneaky = await visitor.from('enquiries').insert({
    first_name: 'RLS', last_name: 'TEST', email: 'rls@example.com', event_type: 'Wedding', status: 'booked',
  });
  check('Visitor cannot send an enquiry with a fake status', Boolean(sneaky.error));

  for (const table of ['enquiries', 'profiles', 'events', 'quotations', 'payments', 'expenses', 'audit_log', 'event_financials']) {
    const r = await visitor.from(table).select('*').limit(1);
    check(`Visitor cannot read ${table}`, blocked(r), r.data);
  }

  const unpublished = await visitor.from('gallery_media').select('id').eq('is_published', false).limit(1);
  check('Visitor cannot see unpublished gallery items', blocked(unpublished), unpublished.data);

  const addMedia = await visitor.from('gallery_media').insert({ category: 'wedding', media_type: 'image', storage_path: `rls/${stamp}-visitor.png` });
  check('Visitor cannot add gallery items', Boolean(addMedia.error));

  const upload = await visitor.storage.from('gallery').upload(`rls/${stamp}-visitor.png`, new Blob(['x'], { type: 'image/png' }));
  check('Visitor cannot upload files', Boolean(upload.error));
}

// ---------------------------------------------------------------------
section('Admin');
const eventInsert = await admin.from('events').insert({
  title: `RLS TEST event ${stamp}`, event_type: 'wedding', event_date: '2030-01-15', customer_name: 'RLS TEST customer',
}).select().single();
check('Admin CAN create an event', !eventInsert.error, eventInsert.error?.message);
const eventId = eventInsert.data?.id;

const seeEnquiries = await admin.from('enquiries').select('id').limit(1);
check('Admin CAN read enquiries', !seeEnquiries.error && seeEnquiries.data.length > 0, seeEnquiries.error?.message);

const q1 = await admin.from('quotations').insert({ event_id: eventId, amount: 50000, notes: 'RLS TEST' }).select().single();
check('Admin CAN add a quotation', !q1.error, q1.error?.message);
const q1Edit = await admin.from('quotations').update({ amount: 52000 }).eq('id', q1.data?.id).select();
check('Admin CAN edit a quotation', !q1Edit.error && q1Edit.data?.length === 1, q1Edit.error?.message);
const q1Delete = await admin.from('quotations').delete().eq('id', q1.data?.id).select();
check('Admin cannot delete a quotation', blocked(q1Delete), q1Delete.data);

const adminPay = await admin.from('payments').insert({ event_id: eventId, amount: 1000, paid_on: '2030-01-01', method: 'cash' });
check('Admin cannot add a payment', Boolean(adminPay.error));
const adminExp = await admin.from('expenses').insert({ event_id: eventId, amount: 1000, spent_on: '2030-01-01', category: 'other' });
check('Admin cannot add an expense', Boolean(adminExp.error));

const fakeCreator = await admin.from('events').insert({
  title: 'RLS TEST fake creator', event_type: 'other', event_date: '2030-01-01', customer_name: 'x', created_by: acctProfile.id,
});
check('Admin cannot pretend someone else created a record', Boolean(fakeCreator.error));

// ---------------------------------------------------------------------
section('Accountant');
{
  const r = await accountant.from('enquiries').select('id').limit(1);
  check('Accountant cannot read enquiries', blocked(r), r.data);

  const ev = await accountant.from('events').select('id').eq('id', eventId);
  check('Accountant CAN view events', !ev.error && ev.data.length === 1, ev.error?.message);

  const newEvent = await accountant.from('events').insert({ title: 'RLS TEST', event_type: 'other', event_date: '2030-01-01', customer_name: 'x' });
  check('Accountant cannot create events', Boolean(newEvent.error));

  const editEvent = await accountant.from('events').update({ title: 'hacked' }).eq('id', eventId).select();
  check('Accountant cannot edit events', blocked(editEvent), editEvent.data);

  const promote = await accountant.from('profiles').update({ role: 'admin' }).eq('id', acctProfile.id).select();
  check('Accountant cannot make themselves admin', blocked(promote), promote.data);

  const others = await accountant.from('profiles').select('id').neq('id', acctProfile.id);
  check("Accountant cannot see other staff profiles", blocked(others), others.data);

  const media = await accountant.from('gallery_media').insert({ category: 'wedding', media_type: 'image', storage_path: `rls/${stamp}-acct.png` });
  check('Accountant cannot add gallery items', Boolean(media.error));

  const upload = await accountant.storage.from('gallery').upload(`rls/${stamp}-acct.png`, new Blob(['x'], { type: 'image/png' }));
  check('Accountant cannot upload gallery files', Boolean(upload.error));
}

const q2 = await accountant.from('quotations').insert({ event_id: eventId, amount: 60000, notes: 'RLS TEST revised' }).select().single();
check('Accountant CAN add a quotation', !q2.error, q2.error?.message);
const q2Edit = await accountant.from('quotations').update({ amount: 65000 }).eq('id', q2.data?.id).select();
check('Accountant CAN edit a quotation', !q2Edit.error && q2Edit.data?.length === 1, q2Edit.error?.message);

const p1 = await accountant.from('payments').insert({ event_id: eventId, amount: 20000, paid_on: '2030-01-02', method: 'cash', reference: ref('P1') }).select().single();
check('Accountant CAN add a payment', !p1.error, p1.error?.message);
const dup = await accountant.from('payments').insert({ event_id: eventId, amount: 20000, paid_on: '2030-01-02', method: 'cash', reference: ref('P1') });
check('Duplicate payment reference is rejected', Boolean(dup.error));
const zero = await accountant.from('payments').insert({ event_id: eventId, amount: 0, paid_on: '2030-01-02', method: 'cash' });
check('Zero payment is rejected', Boolean(zero.error));
const negative = await accountant.from('payments').insert({ event_id: eventId, amount: -500, paid_on: '2030-01-02', method: 'cash' });
check('Negative payment is rejected', Boolean(negative.error));
const badMethod = await accountant.from('payments').insert({ event_id: eventId, amount: 100, paid_on: '2030-01-02', method: 'bitcoin' });
check('Unknown payment method is rejected', Boolean(badMethod.error));

const p2 = await accountant.from('payments').insert({ event_id: eventId, amount: 10000, paid_on: '2030-01-03', method: 'upi', reference: ref('P2') }).select().single();
check('Accountant CAN add a second payment', !p2.error, p2.error?.message);
const voidNoReason = await accountant.from('payments').update({ is_void: true }).eq('id', p2.data?.id).select();
check('Voiding without a reason is rejected', Boolean(voidNoReason.error));
const voidOk = await accountant.from('payments').update({ is_void: true, void_reason: 'RLS TEST entered twice' }).eq('id', p2.data?.id).select().single();
check('Accountant CAN void a payment with a reason', !voidOk.error && voidOk.data?.voided_by === acctProfile.id && voidOk.data?.voided_at, voidOk.error?.message || voidOk.data);
const editVoided = await accountant.from('payments').update({ amount: 1 }).eq('id', p2.data?.id).select();
check('A voided payment cannot be changed', Boolean(editVoided.error));
const delPay = await accountant.from('payments').delete().eq('id', p1.data?.id).select();
check('Payments cannot be deleted', blocked(delPay), delPay.data);
const sameRefAfterVoid = await accountant.from('payments').insert({ event_id: eventId, amount: 5000, paid_on: '2030-01-04', method: 'upi', reference: ref('P2') });
check('A voided reference can be re-entered correctly', !sameRefAfterVoid.error, sameRefAfterVoid.error?.message);

const e1 = await accountant.from('expenses').insert({ event_id: eventId, amount: 8000, spent_on: '2030-01-05', category: 'decoration', vendor: 'RLS TEST vendor', reference: ref('BILL1') });
check('Accountant CAN add an expense', !e1.error, e1.error?.message);
const e1dup = await accountant.from('expenses').insert({ event_id: eventId, amount: 8000, spent_on: '2030-01-05', category: 'decoration', vendor: 'RLS TEST vendor', reference: ref('BILL1') });
check('Duplicate bill from same vendor is rejected', Boolean(e1dup.error));

// ---------------------------------------------------------------------
section('Financial calculations (event_financials)');
{
  // Expected: newest quotation 65000; received 20000 + 5000 (10000 was voided) = 25000;
  // outstanding 65000 - 25000 = 40000; expenses 8000; net cash 25000 - 8000 = 17000
  for (const [who, client] of [['accountant', accountant], ['admin', admin]]) {
    const { data, error } = await client.from('event_financials').select('*').eq('event_id', eventId).single();
    const n = (v) => Number(v);
    check(`${who}: quoted = newest quotation (65000)`, !error && n(data.quoted) === 65000, error?.message || data);
    check(`${who}: received excludes voided (25000)`, n(data?.received) === 25000, data);
    check(`${who}: outstanding = quoted - received (40000)`, n(data?.outstanding) === 40000, data);
    check(`${who}: expenses (8000)`, n(data?.expenses) === 8000, data);
    check(`${who}: net cash = received - expenses (17000)`, n(data?.net_cash) === 17000, data);
  }
}

// ---------------------------------------------------------------------
section('History (audit_log)');
{
  const { data } = await accountant.from('audit_log').select('action, table_name').eq('record_id', p2.data?.id);
  check('Payment create + void are both in the history', data?.some((r) => r.action === 'INSERT') && data?.some((r) => r.action === 'UPDATE'), data);
  const q = await accountant.from('audit_log').select('action').eq('record_id', q1.data?.id);
  check('Quotation edits are in the history', q.data?.some((r) => r.action === 'UPDATE'), q.data);
  const evHist = await accountant.from('audit_log').select('id').eq('table_name', 'events').limit(1);
  check('Accountant cannot read non-financial history', blocked(evHist), evHist.data);
  const wipe = await admin.from('audit_log').delete().eq('record_id', p2.data?.id).select();
  check('Nobody can delete history (admin tried)', blocked(wipe), wipe.data);
}

// ---------------------------------------------------------------------
section('Gallery publishing');
{
  const path = `rls-test/${stamp}.png`;
  // 1x1 transparent PNG
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');
  const up = await admin.storage.from('gallery').upload(path, png, { contentType: 'image/png' });
  check('Admin CAN upload a gallery file', !up.error, up.error?.message);

  const row = await admin.from('gallery_media').insert({ category: 'wedding', media_type: 'image', storage_path: path, caption: 'RLS TEST' }).select().single();
  check('Admin CAN add an (unpublished) gallery item', !row.error, row.error?.message);

  const hiddenRow = await visitor.from('gallery_media').select('id').eq('id', row.data?.id);
  check('Visitor cannot see it while unpublished', blocked(hiddenRow), hiddenRow.data);
  const hiddenFile = await visitor.storage.from('gallery').download(path);
  check('Visitor cannot download the file while unpublished', Boolean(hiddenFile.error));

  const pub = await admin.from('gallery_media').update({ is_published: true }).eq('id', row.data?.id).select();
  check('Admin CAN publish it', !pub.error && pub.data?.length === 1, pub.error?.message);

  const shownRow = await visitor.from('gallery_media').select('id').eq('id', row.data?.id);
  check('Visitor CAN see it once published', !shownRow.error && shownRow.data.length === 1, shownRow.error?.message);
  const shownFile = await visitor.storage.from('gallery').download(path);
  check('Visitor CAN download the file once published', !shownFile.error, shownFile.error?.message);

  const acctUnpub = await accountant.from('gallery_media').update({ is_published: false }).eq('id', row.data?.id).select();
  check('Accountant cannot unpublish gallery items', blocked(acctUnpub), acctUnpub.data);
  const acctDelete = await accountant.storage.from('gallery').remove([path]);
  const stillThere = await visitor.storage.from('gallery').download(path);
  check('Accountant cannot delete gallery files', !stillThere.error, acctDelete.error?.message);

  // Clean up the test image
  await admin.from('gallery_media').delete().eq('id', row.data?.id);
  await admin.storage.from('gallery').remove([path]);
  const gone = await visitor.from('gallery_media').select('id').eq('id', row.data?.id);
  check('Admin CAN delete gallery items', blocked(gone), gone.data);
}

// ---------------------------------------------------------------------
section('Protecting money history');
{
  const del = await admin.from('events').delete().eq('id', eventId).select();
  check('An event with payments cannot be deleted', Boolean(del.error) || blocked(del), del.data);
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
