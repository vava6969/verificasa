# Round 6 — client requests (22 Aug 2026)

## SHIPPED
- Step 3: an constructie, disponibil din, descriere are REQUIRED; etaj is now optional (total etaje was already optional). Rules run at Next and again at Publish.
- Action cards: client's own photos, file names match the card (cauta-o-chirie.webp, listeaza-gratuit.webp). Third card is the partner's mark on their green, linking to /parteneri. Photo zooms slightly on hover.
- Countdown moved off Landing, onto About.
- Cards: badge row and both text lines hold their height whether or not there is a badge, so cards in a row share one baseline and one height.
- Footer: real ANPC SAL + SOL banners (white tiles, official wording, DETALII), linking to anpc.ro/ce-este-sal and the EU platform. Drawn, not hotlinked. NEEDS: public/images/legal/anpc-logo.png (the coat of arms) — the tile renders without it.
- Plan copy: "2 x 3D tours" form on listings/tours/boosts across Basic, Pro, Agent, both languages. Free keeps singulars. Basic's "listari de proprietate" unified to "anunturi active".

## DIAGNOSED, NOT AN RLS BUG
- Agent listings missing from home: Property.rls.read is ALREADY null = world-readable, and update/delete are already owner-or-admin. The Agent row is empty because it buckets on Property.poster_plan, which is only ever stamped by VerifyCheckoutSession (return from Stripe) or SyncPosterPlans — and SyncPosterPlans has ZERO callers in the repo. A plan granted by hand in the Base44 dashboard never stamps it. Fix = run the backfill against the live app.
- Map "Promovat" pill: the code exists (MapSearch.jsx:186) and the CSS exists (index.css:362). It only draws when boost_active || featured. Nothing in the data is boosted, or the boosts expired. Blocked behind the boost model.

## BLOCKED ON A DECISION
1. Boosts "not timed" — permanent until delisted / until the owner turns it off / a consumable that stacks? And do existing timed boosts become permanent or expire once? BOOST_DURATION_DAYS=7 lives in src/lib/plans.js:173 AND base44/shared/boosts.js:9.
2. 3D tour link: which plans unlock it? plans.js gives Basic 2 tours, but every string in the app says "Plan Pro".
3. What counts as one tour used? Nothing counts tours today — no field, no entity, no function. A Property row with tour_3d_url refunds on delete; a ledger does not.
4. Free / no-plan owners: what badge does their card carry? KINDS has no free entry and most listings are in that state.
5. Two badges at once (promoted AND plan): the sm size caps at ONE badge and the plan badge is dropped when boosted. Which two win?
6. Every listing visible — does that include PENDING and REJECTED? All public surfaces show APPROVED only today.

## FLAGGED, NOT YET DONE
- PropertyEditForm validates only title/price/city, so the new required fields can be emptied after publish.
- ComputeTrustScore gives 3 of 30 "Esential" points for floor; floorless listings will cap at 27/30 and read "Lipsesc: etaj".
- verificat and basic badges use the SAME image file (plan-badge-basic-v2.png).
- TOUR_3D_APP_URL is null — the capture app does not exist, so the 3D banner CTA is permanently dimmed.

## STILL TO BUILD (unblocked once the above are answered)
- Minimise the 3D banner on the photos step
- "3D tours left" indicator under the listing
- 3-day wait after role granted; one tour per 3 days; enforced server-side
- Boost stepper on the LAST step of the wizard + buy-more from there
- Per-property boost count line on the detail page
- Plan + promoted badge on every card
- Request-a-check entry point in the partner's visual language
