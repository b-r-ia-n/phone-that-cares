---telegram-bot-todo---


- 🚨 anthropic credits topped up may 14 — verified working (classifier classified meditation msg)
- 🐛 fixed today: live-fallback morning path had no idempotency guard → 4× re-fires after credit-restore burned creds, never delivered. crons.ts:317 now sets composing sentinel + lastMorning BEFORE composing, clears on clean error. pushed prod v117.
- open: composition itself sometimes runs >60s and hits val.town fn timeout — deeper fix needed (cap tool rounds dynamically or stream partial state). today's pattern: research loops on essays
- brian missed today's morning entirely (no delivery happened). tomorrow's prep path is unaffected by the sentinel since userToday rolls
- supabase RLS critical on website project (website-agent owns)
- handoff history: share/HANDOFF-2026-05-14.md
- design prototypes iterated → share/design-prototypes-2026-05-13/ (4 pages)
- open: /library/recent surface for trust loop · wire prototypes into live renderer
- doula mode still live on @hello_argobot
