# Permissions + data cross-check — 22 Aug 2026

Read as an anonymous visitor against the live backend.

## RLS matrix (from base44/entities/*.jsonc)

| ENTITY | READ | CREATE | UPDATE | DELETE |
|---|---|---|---|---|
| AuditLog | admin | admin | admin | admin |
| Boost | **PUBLIC** | admin | admin | admin |
| BoostCredit | user+admin | admin | admin | admin |
| Comment | **PUBLIC** | PUBLIC | owner+admin | owner+admin |
| Conversation | admin | owner | admin | admin |
| Coupon | admin | admin | admin | admin |
| CouponRedemption | user+admin | admin | admin | admin |
| Inquiry | owner+admin | PUBLIC | owner+admin | owner+admin |
| InspectionRequest | owner+admin | PUBLIC | owner+admin | owner+admin |
| **Message** | **PUBLIC** | **PUBLIC** | **PUBLIC** | sender+admin |
| Notification | user+admin | admin | user+admin | admin |
| Property | **PUBLIC** | owner | owner+admin | owner+admin |
| PropertyTourRoom | **PUBLIC** | PUBLIC | owner+admin | owner+admin |
| Rating | **PUBLIC** | user | user+admin | user+admin |
| Report | user+admin | {} | admin | admin |
| SavedProfile / SavedProperty / SavedSearch | owner+admin | owner | owner+admin | owner+admin |
| Subscription | user+admin | admin | admin | admin |
| User | (no rls block in the repo file) | | | |
| ViewEvent | **PUBLIC** | PUBLIC | admin | admin |

## Verdict on visibility

Nothing a public listing surface needs is restricted. Property, Boost, Comment, Rating,
ViewEvent and PropertyTourRoom all read PUBLIC. The listings were never hidden by permissions.

The ONE read restriction that mattered is **Subscription = owner+admin**. That is why a
visitor could not tell what plan a listing's owner was on, and why an Agent listing only
sorted as an Agent listing for the agent themselves. Fixed by denormalising the plan onto
Property.poster_plan, which is world-readable.

## The live data, 54 listings

- approval_status: 54 APPROVED, 0 pending, 0 rejected
- country: 54 RO
- status: 49 Activ, 5 Rezervat
- **poster_plan: unset on all 54**
- seller_role: 36 Proprietar, 18 Agent  <- these are SELF-DECLARED, not subscriptions
- **boost_active: 26 false, 28 unset. ZERO promoted listings. ZERO Boost rows.**
- 1 listing has a 3D tour
- 4 distinct owners for all 54 listings

## Subscription table: 3 rows, ONE user

Andrei Mocanu is the only person with any subscription at all:
- basic, **active**, yearly, from 17 Aug 2026
- agent, **cancelled**
- pro, **cancelled**

So the Agent and Pro rows on the home page cannot fill up: nobody in the database holds an
active Agent or Pro plan. The app is behaving correctly; there is nothing to show. Filtering
by Basic shows Andrei's listings once poster_plan is stamped; Agent and Pro stay empty until
an active subscription exists for someone.

The map's "Promovat" pill has the same story: the code and the CSS are both there, and
nothing in the database is boosted.

## To make it all appear

1. Publish, so the new code is live.
2. Admin > Date > "Ruleaza sincronizarea" — stamps poster_plan on all 54 existing listings.
3. In the Base44 dashboard, set the agent and/or pro Subscription rows to active (or create
   real ones on other accounts) if the demo needs those rows populated.
4. Boost a listing if the "Promovat" pill needs to be visible anywhere.

## SECURITY — found in this pass, NOT fixed

**Message rls is read: null, create: null, update: null.** Every private message in the app
can be read and edited by anyone, including logged-out visitors. Only delete is scoped.
It cannot be fixed by editing the rule alone: Message carries only conversation_id and
sender_id, so there is no participant field for RLS to test. Needs participant_ids added,
backfilled, and only then locked down. Tracked as a separate task.

User.jsonc has no rls block in the repo file. User is platform-owned, so this may be the
Base44 default rather than a hole — confirm in the dashboard, do not assume either way.
