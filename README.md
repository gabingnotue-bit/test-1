# Y&I TailorLab (V1)

Private invite-only web app for fashion design/tailoring collaboration.

## Stack
- Next.js (App Router) + TypeScript + Tailwind
- Prisma + SQLite (dev)
- Auth: email/password + bcrypt + JWT session in httpOnly cookie (`jose`)
- Local file storage (`/uploads`) served through authenticated route `/api/files/[id]`

## Quick start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment:
   ```bash
   cp .env.example .env
   ```
3. Create database + Prisma client:
   ```bash
   npx prisma migrate dev --name init
   ```
4. Seed owner user:
   ```bash
   npm run prisma:seed
   ```
5. Start dev server:
   ```bash
   npm run dev
   ```

## Login and invites
- Login at `/login` with `OWNER_EMAIL` / `OWNER_PASSWORD` from `.env`.
- Open `/admin/invites` (OWNER/ADMIN only), create invite by email+role.
- Share acceptance URL shown in list: `/accept-invite?token=...`
- Invite-only policy: no open signup route exists.

## Roles
- OWNER, ADMIN: can create invites.
- DESIGNER+ can create/edit clients, projects, generate model/pattern stubs, and save costs.
- TAILOR: can view validated outputs and download pattern files.
- VIEWER: read-only.

## Costing details
- VAT = 19%.
- UI shows HT first, TTC below.
- TTC is rounded with `Math.round`.
- Cost versions are persisted to project history (no quote PDF export).

## Switch to Postgres later
Only change `DATABASE_URL` in `.env`, then run:
```bash
npx prisma migrate deploy
```
