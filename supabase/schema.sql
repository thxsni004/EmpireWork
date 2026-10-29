-- =====================================================================
-- Empire Events - staff portal database
--
-- HOW TO USE
--   Supabase Dashboard -> SQL Editor -> paste this whole file -> Run.
--   It is safe to run on a NEW, empty project.
--
-- HOW SECURITY WORKS
--   Every table has Row Level Security (RLS) turned on. RLS rules live in
--   the database, so even if someone skips the React screens and calls the
--   API directly, the database still refuses anything they are not allowed
--   to do. Hiding buttons in React is only for convenience, never security.
--
-- WHO CAN DO WHAT (short version)
--   Public visitor : send an enquiry, see PUBLISHED gallery media
--   Accountant     : view events; manage quotations, payments, expenses
--   Admin          : enquiries, events, gallery, staff; view finances;
--                    add and edit quotations (NOT payments or expenses)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Staff profiles and roles
-- ---------------------------------------------------------------------

create type public.staff_role as enum ('admin', 'accountant');

create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text not null default '',
  role       public.staff_role,              -- NULL = no portal access yet
  is_active  boolean not null default true,  -- false = access switched off
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- When a user is created in Supabase Auth, give them a profile with NO role.
-- An admin must then give them a role before they can see anything.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Helper functions used by the security rules below.
-- "security definer" lets them read profiles without being blocked by RLS.
create function public.my_role()
returns public.staff_role
language sql stable
security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and is_active;
$$;

create function public.is_admin()
returns boolean language sql stable set search_path = public as $$
  select coalesce(public.my_role() = 'admin', false);
$$;

create function public.is_accountant()
returns boolean language sql stable set search_path = public as $$
  select coalesce(public.my_role() = 'accountant', false);
$$;

create function public.is_staff()
returns boolean language sql stable set search_path = public as $$
  select public.my_role() is not null;
$$;

-- Never allow the last active admin to be removed (otherwise nobody can manage staff).
create function public.keep_one_admin()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.role = 'admin' and old.is_active
     and (new.role is distinct from 'admin' or not new.is_active)
     and not exists (
       select 1 from public.profiles
       where role = 'admin' and is_active and id <> old.id
     ) then
    raise exception 'At least one active admin is required';
  end if;
  return new;
end;
$$;

create trigger profiles_keep_one_admin
  before update on public.profiles
  for each row execute function public.keep_one_admin();


-- ---------------------------------------------------------------------
-- 2. Shared helper: keep updated_at current
-- ---------------------------------------------------------------------

create function public.set_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- "Who created it" and "when" can never be changed after a record is created
create function public.protect_created_fields()
returns trigger language plpgsql set search_path = public as $$
begin
  new.created_by = old.created_by;
  new.created_at = old.created_at;
  return new;
end;
$$;


-- ---------------------------------------------------------------------
-- 3. Enquiries (from the public contact form)
-- ---------------------------------------------------------------------

create table public.enquiries (
  id               uuid primary key default gen_random_uuid(),
  first_name       text not null check (char_length(first_name) between 1 and 100),
  last_name        text not null check (char_length(last_name) between 1 and 100),
  email            text not null check (char_length(email) between 3 and 200),
  event_type       text not null check (char_length(event_type) <= 50),
  event_date       date,
  referral_source  text check (char_length(referral_source) <= 100),
  referral_name    text check (char_length(referral_name) <= 100),
  planning_needs   text check (char_length(planning_needs) <= 500),
  estimated_budget text check (char_length(estimated_budget) <= 100),
  guest_count      integer check (guest_count between 1 and 100000),
  additional_info  text check (char_length(additional_info) <= 2000),
  status           text not null default 'new'
                   check (status in ('new', 'contacted', 'quoted', 'booked', 'closed', 'spam')),
  admin_notes      text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger enquiries_updated_at before update on public.enquiries
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 4. Events (booked events)
--    event_type uses normal spelling ("corporate").
-- ---------------------------------------------------------------------

create table public.events (
  id             uuid primary key default gen_random_uuid(),
  enquiry_id     uuid references public.enquiries (id) on delete set null,
  title          text not null check (char_length(title) between 1 and 150),
  event_type     text not null
                 check (event_type in ('birthday', 'wedding', 'corporate', 'stage', 'engagement', 'other')),
  event_date     date not null,
  customer_name  text not null check (char_length(customer_name) between 1 and 150),
  customer_phone text check (char_length(customer_phone) <= 30),
  customer_email text check (char_length(customer_email) <= 200),
  venue          text check (char_length(venue) <= 200),
  guest_count    integer check (guest_count > 0),
  status         text not null default 'confirmed'
                 check (status in ('tentative', 'confirmed', 'completed', 'cancelled')),
  notes          text,
  created_by     uuid default auth.uid() references public.profiles (id),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create trigger events_updated_at before update on public.events
  for each row execute function public.set_updated_at();
create trigger events_protect before update on public.events
  for each row execute function public.protect_created_fields();


-- ---------------------------------------------------------------------
-- 5. Money: quotations, payments, expenses (kept in separate tables)
--    numeric(12,2) stores exact rupees and paise (no rounding errors).
--    Events that have money records cannot be deleted ("on delete restrict");
--    cancel them instead, so the financial history is never lost.
-- ---------------------------------------------------------------------

-- Quotations can be added and edited (every edit is saved in audit_log).
-- If an event has more than one quotation, the NEWEST one is the agreed amount.
-- Quotations are never deleted.
create table public.quotations (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events (id) on delete restrict,
  amount     numeric(12, 2) not null check (amount > 0),
  notes      text check (char_length(notes) <= 500),
  created_by uuid default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger quotations_updated_at before update on public.quotations
  for each row execute function public.set_updated_at();
create trigger quotations_protect before update on public.quotations
  for each row execute function public.protect_created_fields();

-- Payments are never deleted. Mistakes are "voided" with a reason.
create table public.payments (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references public.events (id) on delete restrict,
  amount      numeric(12, 2) not null check (amount > 0),
  paid_on     date not null,
  method      text not null check (method in ('cash', 'upi', 'bank_transfer', 'card', 'cheque')),
  reference   text check (char_length(reference) <= 100),  -- UPI / transaction / cheque number
  notes       text check (char_length(notes) <= 500),
  is_void     boolean not null default false,
  void_reason text,
  voided_at   timestamptz,
  voided_by   uuid references public.profiles (id),
  created_by  uuid default auth.uid() references public.profiles (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (not is_void or char_length(trim(coalesce(void_reason, ''))) > 0)
);

-- The same transaction reference cannot be entered twice (ignoring voided rows)
create unique index payments_no_duplicate_reference
  on public.payments (method, lower(trim(reference)))
  where reference is not null and trim(reference) <> '' and not is_void;

create table public.expenses (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid references public.events (id) on delete restrict,  -- NULL = general business expense
  amount      numeric(12, 2) not null check (amount > 0),
  spent_on    date not null,
  category    text not null
              check (category in ('decoration', 'catering', 'venue', 'staff', 'transport', 'equipment', 'other')),
  vendor      text check (char_length(vendor) <= 150),
  reference   text check (char_length(reference) <= 100),  -- bill / invoice number
  notes       text check (char_length(notes) <= 500),
  is_void     boolean not null default false,
  void_reason text,
  voided_at   timestamptz,
  voided_by   uuid references public.profiles (id),
  created_by  uuid default auth.uid() references public.profiles (id),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  check (not is_void or char_length(trim(coalesce(void_reason, ''))) > 0)
);

-- The same bill number from the same vendor cannot be entered twice
create unique index expenses_no_duplicate_bill
  on public.expenses (lower(trim(coalesce(vendor, ''))), lower(trim(reference)))
  where reference is not null and trim(reference) <> '' and not is_void;

-- Rules for changing payments / expenses:
--  * a voided record can never be changed again
--  * when a record is voided, remember who and when
--  * a record that is not voided cannot carry void details
create function public.guard_money_change()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.is_void then
    raise exception 'A voided record cannot be changed';
  end if;
  if new.is_void then
    new.voided_at = now();
    new.voided_by = auth.uid();
  else
    new.void_reason = null;
    new.voided_at = null;
    new.voided_by = null;
  end if;
  new.created_by = old.created_by;
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger payments_guard before update on public.payments
  for each row execute function public.guard_money_change();
create trigger payments_updated_at before update on public.payments
  for each row execute function public.set_updated_at();

create trigger expenses_guard before update on public.expenses
  for each row execute function public.guard_money_change();
create trigger expenses_updated_at before update on public.expenses
  for each row execute function public.set_updated_at();


-- ---------------------------------------------------------------------
-- 6. Gallery media (uploaded photos / videos)
--    category must match the public gallery URL keys, including the
--    existing spelling "corperate" used in /Gallery/corperate.
-- ---------------------------------------------------------------------

create table public.gallery_media (
  id           uuid primary key default gen_random_uuid(),
  category     text not null check (category in ('birthday', 'wedding', 'corperate', 'other', 'stage')),
  media_type   text not null check (media_type in ('image', 'video')),
  storage_path text not null unique,  -- file path inside the "gallery" storage bucket
  caption      text check (char_length(caption) <= 300),
  is_published boolean not null default false,
  event_id     uuid references public.events (id) on delete set null,
  created_by   uuid default auth.uid() references public.profiles (id),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger gallery_media_updated_at before update on public.gallery_media
  for each row execute function public.set_updated_at();
create trigger gallery_media_protect before update on public.gallery_media
  for each row execute function public.protect_created_fields();


-- ---------------------------------------------------------------------
-- 7. Audit log: automatic history of important changes
--    Filled only by the trigger below; nobody can edit or delete it.
-- ---------------------------------------------------------------------

create table public.audit_log (
  id         bigint generated always as identity primary key,
  table_name text not null,
  record_id  uuid,
  action     text not null,  -- INSERT / UPDATE / DELETE
  old_data   jsonb,
  new_data   jsonb,
  changed_by uuid,
  changed_at timestamptz not null default now()
);

create function public.write_audit_log()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.audit_log (table_name, record_id, action, old_data, new_data, changed_by)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end,
    auth.uid()
  );
  return null;  -- "after" triggers ignore the return value
end;
$$;

create trigger audit_profiles      after insert or update or delete on public.profiles      for each row execute function public.write_audit_log();
create trigger audit_events        after insert or update or delete on public.events        for each row execute function public.write_audit_log();
create trigger audit_quotations    after insert or update or delete on public.quotations    for each row execute function public.write_audit_log();
create trigger audit_payments      after insert or update or delete on public.payments      for each row execute function public.write_audit_log();
create trigger audit_expenses      after insert or update or delete on public.expenses      for each row execute function public.write_audit_log();
create trigger audit_gallery_media after insert or update or delete on public.gallery_media for each row execute function public.write_audit_log();


-- ---------------------------------------------------------------------
-- 8. Event money summary (one row per event)
--    All dashboards read from here, so numbers always match.
--    security_invoker = the viewer's own RLS rules still apply.
-- ---------------------------------------------------------------------

create view public.event_financials
with (security_invoker = true) as
select
  e.id            as event_id,
  e.title,
  e.event_type,
  e.event_date,
  e.status,
  e.customer_name,
  coalesce(q.amount, 0)                          as quoted,       -- newest quotation
  coalesce(p.total, 0)                           as received,     -- payments, not voided
  coalesce(q.amount, 0) - coalesce(p.total, 0)   as outstanding,  -- quoted - received
  coalesce(x.total, 0)                           as expenses,     -- expenses, not voided
  coalesce(p.total, 0) - coalesce(x.total, 0)    as net_cash      -- received - expenses
from public.events e
left join lateral (
  select amount from public.quotations
  where event_id = e.id
  order by created_at desc
  limit 1
) q on true
left join lateral (
  select sum(amount) as total from public.payments
  where event_id = e.id and not is_void
) p on true
left join lateral (
  select sum(amount) as total from public.expenses
  where event_id = e.id and not is_void
) x on true;


-- ---------------------------------------------------------------------
-- 9. Turn on Row Level Security for every table
-- ---------------------------------------------------------------------

alter table public.profiles      enable row level security;
alter table public.enquiries     enable row level security;
alter table public.events        enable row level security;
alter table public.quotations    enable row level security;
alter table public.payments      enable row level security;
alter table public.expenses      enable row level security;
alter table public.gallery_media enable row level security;
alter table public.audit_log     enable row level security;


-- ---------------------------------------------------------------------
-- 10. Security rules (policies)
--     No policy = not allowed. So "no delete policy" means nobody can delete.
-- ---------------------------------------------------------------------

-- Profiles: you can see your own; admins see and manage everyone.
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "profiles: admin updates" on public.profiles
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Enquiries: anyone may SEND one (only as status "new"); only admins read/manage.
create policy "enquiries: public can send" on public.enquiries
  for insert to anon, authenticated with check (status = 'new' and admin_notes is null);
create policy "enquiries: admin reads" on public.enquiries
  for select to authenticated using (public.is_admin());
create policy "enquiries: admin updates" on public.enquiries
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "enquiries: admin deletes" on public.enquiries
  for delete to authenticated using (public.is_admin());

-- Events: all staff can view; only admins add/edit/delete.
create policy "events: staff read" on public.events
  for select to authenticated using (public.is_staff());
create policy "events: admin inserts" on public.events
  for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
create policy "events: admin updates" on public.events
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "events: admin deletes" on public.events
  for delete to authenticated using (public.is_admin());

-- Quotations: all staff view; admin and accountant add and edit. Never deleted.
create policy "quotations: staff read" on public.quotations
  for select to authenticated using (public.is_staff());
create policy "quotations: staff insert" on public.quotations
  for insert to authenticated with check (public.is_staff() and created_by = auth.uid());
create policy "quotations: staff update" on public.quotations
  for update to authenticated using (public.is_staff()) with check (public.is_staff());

-- Payments: all staff view; only the accountant adds and edits/voids. Never deleted.
create policy "payments: staff read" on public.payments
  for select to authenticated using (public.is_staff());
create policy "payments: accountant inserts" on public.payments
  for insert to authenticated with check (public.is_accountant() and not is_void and created_by = auth.uid());
create policy "payments: accountant updates" on public.payments
  for update to authenticated using (public.is_accountant()) with check (public.is_accountant());

-- Expenses: same rules as payments.
create policy "expenses: staff read" on public.expenses
  for select to authenticated using (public.is_staff());
create policy "expenses: accountant inserts" on public.expenses
  for insert to authenticated with check (public.is_accountant() and not is_void and created_by = auth.uid());
create policy "expenses: accountant updates" on public.expenses
  for update to authenticated using (public.is_accountant()) with check (public.is_accountant());

-- Gallery: visitors see only PUBLISHED items; admins see and manage all.
create policy "gallery: public sees published" on public.gallery_media
  for select to anon, authenticated using (is_published or public.is_admin());
create policy "gallery: admin inserts" on public.gallery_media
  for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
create policy "gallery: admin updates" on public.gallery_media
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "gallery: admin deletes" on public.gallery_media
  for delete to authenticated using (public.is_admin());

-- Audit log: admins read everything; accountants read money history only.
create policy "audit: read" on public.audit_log
  for select to authenticated using (
    public.is_admin()
    or (public.is_accountant() and table_name in ('quotations', 'payments', 'expenses'))
  );


-- ---------------------------------------------------------------------
-- 11. Table permissions for the API roles
--     (RLS above decides WHICH rows; these decide which tables at all.)
-- ---------------------------------------------------------------------

revoke all on all tables in schema public from anon;
grant insert on public.enquiries to anon;
grant select on public.gallery_media to anon;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on public.event_financials to authenticated;


-- ---------------------------------------------------------------------
-- 12. Storage bucket for gallery uploads
--     PRIVATE bucket: files can only be opened if the rules below allow it.
--     Limit: 50 MB per file (Supabase free plan maximum).
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('gallery', 'gallery', false, 52428800,
        array['image/jpeg', 'image/png', 'image/webp', 'video/mp4'])
on conflict (id) do nothing;

-- Visitors can open a file only if its gallery_media row is published.
create policy "gallery files: read published or admin" on storage.objects
  for select to anon, authenticated using (
    bucket_id = 'gallery'
    and (
      public.is_admin()
      or exists (
        select 1 from public.gallery_media m
        where m.storage_path = storage.objects.name and m.is_published
      )
    )
  );
create policy "gallery files: admin uploads" on storage.objects
  for insert to authenticated with check (bucket_id = 'gallery' and public.is_admin());
create policy "gallery files: admin updates" on storage.objects
  for update to authenticated using (bucket_id = 'gallery' and public.is_admin());
create policy "gallery files: admin deletes" on storage.objects
  for delete to authenticated using (bucket_id = 'gallery' and public.is_admin());


-- ---------------------------------------------------------------------
-- 13. AFTER RUNNING THIS FILE: make yourself the first admin
--     1. Authentication -> Users -> "Add user" (email + password)
--     2. Run this, with your email:
--
--        update public.profiles set role = 'admin', full_name = 'Your Name'
--        where email = 'you@example.com';
--
--     Later admins/accountants can be given roles from the Staff page.
-- ---------------------------------------------------------------------
