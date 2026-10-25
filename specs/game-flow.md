# Kampanykorut Game Flow Test Plan

## Application Overview

Test plan for the Kampanykorut (Hungarian election-campaign game) covering campaign selection, side selection, gameplay through end results, save/load, refresh and localStorage persistence, and mobile responsiveness. IMPORTANT: this plan was authored from source and existing-test review ONLY. The planner browser could not be started (planner_setup_page failed because playwright/seed.spec.ts threw "test.describe() not expected here", typically a duplicate @playwright/test install), so no behaviour was verified live. Items marked [UNVERIFIED] are inferences from code and must be confirmed on first execution. Existing coverage not duplicated: playwright/test/campaign.spec.ts (programmatic 32-question playthroughs via playCampaign, end-results tabs, 199 seats), settings.spec.ts (language change), sideSelector.spec.ts (party/candidate dropdown on 0001_test_campaign). Conventions: locale hu-HU; fixtures from playwright/helpers/fixtures set localStorage kampanykorut_debugMode=true (so unpublished campaigns show) and expose seedCampaign/playCampaign/getCampaignState via window.kampanykorut. Starting state for every scenario is a fresh browser context with empty localStorage unless stated. Stable locators seen in source: getByTestId('menuItem-settings') (menu items use menuItem-<id>), 'partySelector', 'candidateSelector', dropdown options by data-testid=<option value>, 'saveButton', 'showAdvisorFeedback', 'changeLanguage', 'news-bell', question card root data-testid=<questionId>; role buttons by Hungarian labels (e.g. 'Választási térkép', 'Statisztikák', 'Előzmények'); the question Continue button is disabled until an answer is chosen. Storage keys (from ConfigEngine.test.ts, [UNVERIFIED] live): kampanykorut_currentSessionId, kampanykorut_campaignState-<sessionId>, kampanykorut_turnHistory-<sessionId>, kampanykorut_savedSessions, kampanykorut_autoSaveRegistry, kampanykorut_settings, kampanykorut_debugMode; legacy kampanykorut_campaignConfig-<id> keys should be purged.

## Test Scenarios

### 1. 1. Campaign selection and side selection

**Seed:** `playwright/seed.spec.ts`

#### 1.1. Main menu shows expected entries

**File:** `playwright/test/game-flow/menu.spec.ts`

**Steps:**
  1. Navigate to /menu
    - expect: Menu items new game, load game, settings, about are visible
    - expect: Version/dev footer text is visible
    - expect: News bell and bug reporter buttons are visible top right
  2. Click the logo quote text
    - expect: A (possibly different) random quote is shown; no navigation occurs

#### 1.2. Campaign dropdown lists campaigns sorted by year descending

**File:** `playwright/test/game-flow/campaign-select.spec.ts`

**Steps:**
  1. Navigate to /menu and click New game, then the classic mode entry (route /new-game/classic)
    - expect: Campaign dropdown with placeholder is shown
    - expect: Next button is disabled
    - expect: Back button is visible
  2. Open the dropdown
    - expect: Campaigns appear newest year first
    - expect: With debugMode=true unpublished campaigns (e.g. _0001_/0001_test_campaign) are included
  3. Select a campaign
    - expect: Heading changes to campaign label
    - expect: Banner image and description appear
    - expect: Next becomes enabled

#### 1.3. Unpublished campaigns hidden when debug mode off

**File:** `playwright/test/game-flow/campaign-select.spec.ts`

**Steps:**
  1. In a context WITHOUT the fixtures page (plain @playwright/test), open /new-game/classic
    - expect: Only isPublished campaigns are listed; test campaign is absent

#### 1.4. Select party and candidate then start game

**File:** `playwright/test/game-flow/start-game.spec.ts`

**Steps:**
  1. Go to /new-game/classic/sides/2022_beke_vs_remeny
    - expect: candidateSelector is disabled until a party is chosen
  2. Choose party via partySelector, then a candidate
    - expect: Start/next control becomes enabled
  3. Start the game
    - expect: URL becomes /game/2022_beke_vs_remeny?sessionId=<id>
    - expect: First question card renders with answers labelled A-D
    - expect: localStorage has kampanykorut_currentSessionId and kampanykorut_campaignState-<id> with playerSide.partyId/candidateId

#### 1.5. Changing party resets candidate

**File:** `playwright/test/game-flow/start-game.spec.ts`

**Steps:**
  1. Pick party A + candidate, then switch to party B
    - expect: Candidate is cleared and must be re-chosen; start stays disabled (extends sideSelector.spec.ts)

#### 1.6. Invalid campaign id on side selector route

**File:** `playwright/test/game-flow/negative.spec.ts`

**Steps:**
  1. Navigate to /new-game/classic/sides/does_not_exist
    - expect: ErrorPage (errorElement) is shown rather than a blank screen or infinite loading; no uncaught exception beyond the logged loader error

#### 1.7. Back navigation from side selector

**File:** `playwright/test/game-flow/start-game.spec.ts`

**Steps:**
  1. From the side selector press Back/browser back
    - expect: Return to campaign selector; campaignState in storage is reset (selector clears it on mount); no stale session started

#### 1.8. Newly added 2018_a-g-nap-utan campaign is selectable and playable

**File:** `playwright/test/game-flow/new-campaign-2018.spec.ts`

**Steps:**
  1. Find the 2018 campaign in the dropdown (check isPublished flag) and go to its side selector
    - expect: Config loads, parties/candidates listed, assets (banner, portraits) load without 404
  2. Run playCampaign for it with first party/candidate
    - expect: isEnded true, mandates sum to 199, no party id starts with '_'

### 2. 2. Gameplay and rounds

**Seed:** `playwright/seed.spec.ts`

#### 2.1. Answering requires selection; Continue advances a round

**File:** `playwright/test/game-flow/gameplay.spec.ts`

**Steps:**
  1. Use seedCampaign(campaign, party, candidate) then goto /game/<id>?sessionId=<sid>
    - expect: Question 1 shown; Continue disabled
  2. Click an answer row
    - expect: Row highlighted (blue border), Continue enabled
  3. Click a different answer
    - expect: Selection moves; only one selected
  4. Click Continue
    - expect: Next view/question loads; turn in campaignState increments; selection is cleared on the new question

#### 2.2. Map view toggle during a question

**File:** `playwright/test/game-flow/gameplay.spec.ts`

**Steps:**
  1. Click the map view button on the question card (secondary button, hu label under questionCard.buttons.mapView)
    - expect: Map view appears; can return to question without losing the selected answer [UNVERIFIED]

#### 2.3. Strategic decision question shows badge and tooltip

**File:** `playwright/test/game-flow/gameplay.spec.ts`

**Steps:**
  1. Reach a question with affects (e.g. 2026_ogyv_tisza_v2-1 in 2026_tavaszi_szel)
    - expect: Strategic decision badge is visible; hovering shows tooltip

#### 2.4. Advisor feedback toggle respected

**File:** `playwright/test/game-flow/gameplay.spec.ts`

**Steps:**
  1. Disable showAdvisorFeedback in settings, start a game and answer
    - expect: No advisor feedback shown; enabling it shows feedback

#### 2.5. Play full game manually through UI to end results (one campaign)

**File:** `playwright/test/game-flow/full-ui-playthrough.spec.ts`

**Steps:**
  1. Loop 32 times: pick first answer, click Continue, handle any interstitial/map/result dialogs
    - expect: After last round, redirect to /game/<id>/end-results?sessionId=<sid>
    - expect: Buttons Választási térkép, Statisztikák, Előzmények present; 'Előzmények' shows '32 forduló'

#### 2.6. End results navigation tabs

**File:** `playwright/test/game-flow/end-results.spec.ts`

**Steps:**
  1. Use playCampaign then open end-results
    - expect: Result navigation at top (recent commit moved it to the top), Statisztikák shows 'Egyéni mandátumok', Előzmények lists 32 rounds; seats total 199

#### 2.7. Opening /game/<id> for an ended session redirects to end results

**File:** `playwright/test/game-flow/end-results.spec.ts`

**Steps:**
  1. After playCampaign, goto /game/<id>?sessionId=<sid>
    - expect: Browser ends on /game/<id>/end-results?sessionId=<sid> (loader does window.location.href full reload) and results render

#### 2.8. Double-click Continue does not skip a round

**File:** `playwright/test/game-flow/gameplay.spec.ts`

**Steps:**
  1. Select an answer and double-click Continue
    - expect: Only one turn is consumed; turn increments by exactly 1

### 3. 3. Save and resume

**Seed:** `playwright/seed.spec.ts`

#### 3.1. Save to an empty slot and load it

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Mid-game open the in-game menu and choose Save
    - expect: Dialog lists empty slots (label from emptySlot.label) and used slots; Save disabled until a slot is selected
  2. Click an empty slot
    - expect: Text input appears prefilled with '<campaignId>-<locale date>', autofocused; Save enabled
  3. Clear the name to blank/whitespace
    - expect: Save disabled
  4. Enter 'Slot A' and Save
    - expect: Dialog closes; kampanykorut_savedSessions contains an entry named 'Slot A' with lastSaved
  5. Go to /menu > Load game
    - expect: 'Slot A' listed with hu-HU formatted date; choosing it opens /game/<id>?sessionId=<sid> at the saved turn

#### 3.2. Overwrite an existing slot

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Advance two rounds, save, choose the used slot (aria-pressed=true)
    - expect: Save overwrites; loading restores the later turn; slot count unchanged

#### 3.3. Slot limit

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Fill all available slots
    - expect: No empty slot buttons remain; only used slots selectable; no extra slot created

#### 3.4. Cancel save

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Open save dialog, select slot, click Cancel / press Escape
    - expect: Dialog closes; selection reset; nothing stored

#### 3.5. Very long and special-character slot names

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Save with 300-char name and with '<script>' / emoji / Hungarian accents
    - expect: Name wraps (break-all) without overflow; rendered as text, not HTML; persists intact

#### 3.6. Load game with no saves

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Fresh state: /menu > Load game
    - expect: Empty-state message or empty list; no crash

#### 3.7. Autosave registry

**File:** `playwright/test/game-flow/save-load.spec.ts`

**Steps:**
  1. Play several rounds then inspect kampanykorut_autoSaveRegistry and the load menu
    - expect: Autosave entry exists for the session [UNVERIFIED how it surfaces in UI]

#### 3.8. Resume by direct URL with sessionId

**File:** `playwright/test/game-flow/session-id.spec.ts`

**Steps:**
  1. Start game, copy URL, open it in a new tab of the same context
    - expect: Game resumes at the current turn; same sessionId

#### 3.9. Two sessions are isolated

**File:** `playwright/test/game-flow/session-id.spec.ts`

**Steps:**
  1. Start game 1, answer 3 rounds; start game 2 in a different campaign; return to game 1 via load menu
    - expect: Game 1 retains turn 3 and its own side; keys campaignState-<id> are separate

### 4. 4. Refresh and localStorage persistence

**Seed:** `playwright/seed.spec.ts`

#### 4.1. Inspect storage shape mid-game

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Start a game, answer 2 rounds, evaluate Object.keys(localStorage)
    - expect: Keys prefixed kampanykorut_ include currentSessionId, campaignState-<sid>, turnHistory-<sid>, settings (after change), debugMode; no kampanykorut_campaignConfig-* key (config no longer cached); campaignState JSON has activeCampaignId, playerSide, turn, isEnded

#### 4.2. Reload on question screen keeps turn

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. At turn N with an answer selected but not confirmed, reload
    - expect: Same question N is shown; unconfirmed selection is not persisted (answer cleared) [UNVERIFIED]
    - expect: Turn count unchanged; no turn skipped or repeated

#### 4.3. Reload immediately after Continue

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Click Continue then reload within 100 ms
    - expect: State is consistent: either turn N+1 persisted or still N, never corrupted

#### 4.4. Reload on end results

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. After playCampaign, reload end-results URL
    - expect: Results re-render identically; seats still total 199

#### 4.5. Reload on map view and in menus

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Reload on /menu, /settings, /load-game, /about, /privacy, /news
    - expect: Each renders; settings preserved (language)

#### 4.6. Clear localStorage mid-game then reload

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Mid-game run localStorage.clear(); reload the /game/<id>?sessionId=<sid> URL
    - expect: App does not white-screen; user gets a recoverable state (redirect to menu or error message). Source: loader only logs a warn when no state, so behaviour of the game screen with null state must be recorded [UNVERIFIED]

#### 4.7. Stale or invalid sessionId on game route

**File:** `playwright/test/game-flow/negative.spec.ts`

**Steps:**
  1. Goto /game/2022_beke_vs_remeny?sessionId=nonexistent
    - expect: No crash; record result (new game? error? blank?)
  2. Goto /game/2022_beke_vs_remeny with no sessionId
    - expect: Same: graceful handling
  3. Goto /game/unknown_campaign?sessionId=x
    - expect: ErrorPage shown (config load failure) and campaign_load_failed tracked

#### 4.8. Stale or invalid sessionId on end-results

**File:** `playwright/test/game-flow/negative.spec.ts`

**Steps:**
  1. Goto /game/2022_beke_vs_remeny/end-results?sessionId=bogus
    - expect: Loader returns null when there is no state; page should show a friendly message or redirect, not throw [UNVERIFIED]
  2. Goto end-results for a session that is NOT ended (mid-game)
    - expect: Defined behaviour: redirect to game or empty results without crash

#### 4.9. sessionId and campaign mismatch

**File:** `playwright/test/game-flow/negative.spec.ts`

**Steps:**
  1. Take sessionId of a 2022 game and open /game/2026_tavaszi_szel?sessionId=<it>
    - expect: No mixed state corruption; record behaviour (loader loads config from URL id but state from session)

#### 4.10. Corrupted localStorage JSON

**File:** `playwright/test/game-flow/negative.spec.ts`

**Steps:**
  1. Set kampanykorut_campaignState-<sid> to '{bad json', then reload game URL
    - expect: App recovers or shows error page; no infinite loading ('loading...' hydrate fallback must disappear)
  2. Set kampanykorut_settings to invalid JSON, open /settings
    - expect: Defaults used, page renders
  3. Set kampanykorut_debugMode to 'notjson' and open /new-game/classic
    - expect: Selector uses JSON.parse without try/catch, so a SyntaxError may crash the page (suspected bug, [UNVERIFIED])

#### 4.11. localStorage unavailable or quota exceeded

**File:** `playwright/test/game-flow/negative.spec.ts`

**Steps:**
  1. Stub Storage.prototype.setItem to throw QuotaExceededError then play a round
    - expect: storageErrorNotifier surfaces a user-visible notice; game does not crash

#### 4.12. Legacy cached config keys are purged

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Pre-set kampanykorut_campaignConfig-2026_tavaszi_szel to a large string, load app
    - expect: Key removed on startup, other kampanykorut_ keys kept

#### 4.13. Settings persist across reload

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Change language to hu, save, reload
    - expect: UI remains Hungarian; saveButton disabled again

#### 4.14. Browser back/forward during game

**File:** `playwright/test/game-flow/persistence.spec.ts`

**Steps:**
  1. Play 2 rounds, press browser Back, then Forward
    - expect: No duplicate turn consumption; state matches storage

### 5. 5. Mobile gameplay and responsive UI

**Seed:** `playwright/seed.spec.ts`

#### 5.1. Mobile menu layout at 390x844

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. test.use viewport 390x844, isMobile, hasTouch; open /menu
    - expect: No horizontal scroll (document.scrollWidth <= innerWidth)
    - expect: Menu items fully visible/scrollable; logo scales (w-48); quote wraps within 300px

#### 5.2. Campaign selector stacked buttons on mobile

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Open /new-game/classic at 390x844 and select a campaign
    - expect: Buttons stack with Next above Back (flex-col-reverse); the 450px (w-112.5) container does not overflow 390px; banner and description fit

#### 5.3. Side selector dropdowns usable by touch

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Tap partySelector, option, candidateSelector, option
    - expect: Dropdown menus stay inside viewport; options tappable (>=44px high ideally); long party names truncate or wrap

#### 5.4. Question card narrow layout

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Start a game at 390x844 (below md 768px)
    - expect: NarrowActions used: portrait 56px, city name, party logo, full-width Continue and Map buttons stacked
    - expect: Long question and answers scroll inside the card while Continue stays visible without page scroll
    - expect: Continue and Map buttons height >= 40px
  2. Select answer by tap and tap Continue
    - expect: Works; selected row highlighted

#### 5.5. Breakpoint transition at 767 vs 768 px

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Resize from 768 to 767 px mid-question
    - expect: Layout switches Wide/Narrow without losing selected answer or turn

#### 5.6. Orientation landscape 844x390

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Use viewport 844x390 in a game
    - expect: Continue button reachable via scrolling; no clipped controls

#### 5.7. Small viewport 320x568 stress

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Use 320x568 on menu, selector, question, end results
    - expect: No horizontal overflow; all primary actions reachable

#### 5.8. Mobile save dialog

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Open save dialog at 390x844 with many slots and a long name
    - expect: List limited to max-h-[50vh] and scrolls; slots min-height 64px; buttons visible

#### 5.9. Mobile end results

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Open end-results at 390x844, switch Választási térkép, Statisztikák, Előzmények
    - expect: Navigation at top usable; map fits/pans; tables scroll horizontally inside container, not the page

#### 5.10. Mobile persistence

**File:** `playwright/test/game-flow/mobile.spec.ts`

**Steps:**
  1. Mid-game on mobile reload page
    - expect: Same turn resumes; layout is still the narrow variant
