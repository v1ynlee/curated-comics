# Studio Guide

Studio is the protected editorial workspace at `/studio`. It is designed for daily operation: creating titles, managing creators, publishing articles, curating the public site, reviewing QA issues, recovering drafts, and auditing changes.

## Access

1. Open `/studio/login`.
2. Enter your email address.
3. Click the Supabase magic link in your inbox.
4. The callback route exchanges the token and redirects you to `/studio`.

If login fails, verify Supabase Auth redirect URLs include `/auth/callback` for both local and production URLs.

## Navigation

| Route | Purpose |
| --- | --- |
| `/studio` | Operational dashboard. |
| `/studio/tasks` | Unified work queue. |
| `/studio/titles` | Title list and management. |
| `/studio/titles/new` | Create a title. |
| `/studio/titles/[slug]` | Edit a title. |
| `/studio/creators` | Manage authors, artists, and studios. |
| `/studio/articles` | Manage editorial articles. |
| `/studio/articles/new` | Create an article. |
| `/studio/articles/[slug]` | Edit an article. |
| `/studio/media` | Browse uploaded media assets. |
| `/studio/curation` | Manage homepage/public curation. |
| `/studio/qa` | Review content health issues and quick fixes. |
| `/studio/activity` | Audit editorial activity. |

Desktop uses the top navigation. Mobile uses the bottom dock, which scrolls horizontally when there are more items than available width.

## Dashboard

The Studio dashboard is a command center, not just a statistics page.

Use it to answer:

- What needs attention today?
- Which QA issues should be reviewed first?
- Which articles are scheduled or overdue?
- Are there local drafts to recover?
- Were there low-confidence AI edits?
- What changed recently?
- How complete is the title catalog?

Main dashboard sections:

| Section | How To Use It |
| --- | --- |
| Attention Required | Open high-priority QA and operational issues. |
| Article Workflow | Track Needs Edit, Ready For Review, Approved, and Scheduled Today counts. |
| Needs Review Queue | Jump into QA/task items. |
| Scheduled Content | Review scheduled and overdue articles. |
| Draft Recovery | Resume or discard browser-local drafts. |
| Low Confidence AI | Review AI-assisted changes with medium/low confidence metadata. |
| Recent Editorial Activity | Inspect recent create/update/archive/AI/QA events. |
| Content Health | Review completion score, missing reviews, broken narratives, and low-completion titles. |

## Tasks

The task queue at `/studio/tasks` aggregates work from multiple systems.

Task sources:

- QA issues.
- Article workflow states such as Needs Edit and Ready For Review.
- Failed article workflow validation.
- Low/medium confidence AI activity.
- Browser-local draft recovery.
- Creator image, biography, and relationship gaps.
- Narrative validation issues.

Filters:

`All`, `Titles`, `Articles`, `Creators`, `Narratives`, `AI`, `QA`.

Actions:

| Action | Meaning |
| --- | --- |
| Open | Go directly to the relevant editor or source page. |
| Resolve | Go to the page where the issue can be fixed. |
| Assign | Go to the assignment-oriented workflow when applicable. |
| Ignore | Persistently ignore server-derived tasks or discard local draft tasks. |

## Titles

Use `/studio/titles` to search, filter, sort, and open title records.

Title editor areas:

| Area | Purpose |
| --- | --- |
| Details | English/original/alternative titles, origin, statuses, dates, synopsis, vibe, genres, moods, creators. |
| Progress | Reading progress and dates. |
| Reviews | Markdown review, spoiler-safe content, quotable lines, review state. |
| Media | Cover, banner, gallery, and uploaded assets. |
| Settings | Featured/hidden flags and editorial visibility. |
| Completion | Weighted readiness score and checklist. |

Title completion scoring checks cover, synopsis, genres, moods, creators, reading URLs, review status, tier assignment, gallery assets, and curation eligibility.

## AI Title Autofill

If Gemini is configured, title forms can use AI assistance.

Workflow:

1. Enter a title query.
2. Click `Fill With AI`.
3. Review old/new values in the preview modal.
4. Check only fields you trust.
5. Apply selected fields or discard.

Confidence labels identify high, medium, and low confidence fields. Applying mostly low-confidence fields requires confirmation. AI apply/reject events are logged to Activity.

## Creators

Use `/studio/creators` to manage:

- Authors.
- Artists.
- Studios.

Creator actions:

- Create creator.
- Edit biography, profile image, slug, and title relationships.
- Preview public profile.
- Archive or restore.
- Delete.

Creator images upload through the media pipeline. Archived creators are excluded from public featured placements and task checks where appropriate.

## Articles

Articles have two separate states.

| State Type | Field | Values | Purpose |
| --- | --- | --- | --- |
| Publication | `publication_state` | `draft`, `scheduled`, `published`, `archived` | Determines public visibility and publish mechanics. |
| Editorial | `editorial_state` | `draft`, `needs_edit`, `ready_for_review`, `approved`, `scheduled`, `published`, `archived` | Tracks editorial review workflow. |

Article editor checklist validates:

- Title.
- Excerpt.
- Cover.
- Category.
- Tags.
- Content length.
- Reading time.
- Empty content.
- Broken images.
- Broken embeds.
- Missing metadata.

Review-ready or later editorial states are blocked until the checklist passes.

Recommended article workflow:

1. Create as `Draft`.
2. Move to `Needs Edit` while content is incomplete.
3. Move to `Ready For Review` after checklist passes.
4. Move to `Approved` after review.
5. Schedule or publish via publication controls.
6. Archive when content should no longer be public.

## Curation

Use `/studio/curation` for public-site editorial arrangement.

Tabs:

| Tab | Purpose |
| --- | --- |
| Featured | Manage featured titles and creators. |
| Mood Themes | Configure mood discovery presentation. |
| Tiers | Edit tier definitions and public tier labels. |

Narratives are curated sets of 4-6 title slugs. QA and Tasks detect broken references and invalid narrative sizes.

## Media

Use `/studio/media` to inspect uploaded assets by group:

- Title galleries.
- Artist images.
- Author images.
- Studio media assets.

Uploads are typically initiated inside title, article, creator, and curation workflows rather than directly from the media page.

## QA

QA at `/studio/qa` detects content health issues and provides quick actions.

Common issue types:

- Missing covers.
- Missing synopsis.
- Missing creators.
- Missing reading URLs.
- Unreviewed titles.
- Broken featured items.
- Invalid narratives.
- Broken creator placements.

QA supports quick-fix drawers and persistent ignores. Ignored QA items are stored in the database.

## Activity

Activity at `/studio/activity` is an audit trail.

Filters:

`All`, `Titles`, `Articles`, `Creators`, `Curation`, `AI`, `Drafts`, `QA`.

Logged events include:

- Title create/update/archive.
- Article create/update/publish/schedule/workflow changes.
- Creator create/update/archive/restore.
- Curation changes.
- AI apply/reject.
- Draft save/restore/delete.
- QA actions.

The metadata drawer shows actor, timestamp, entity, old values, new values, changed fields, and raw metadata.

## Draft Recovery

Studio forms use browser-local draft recovery.

Supported draft areas:

- Titles.
- Articles.
- Creators.
- Curation.
- Narratives.
- Featured content.

Behavior:

- Unsaved form changes are stored in `localStorage`.
- In-app navigation prompts users to save, discard, or continue.
- Browser close/refresh uses the native unload prompt.
- Draft tasks can appear in the task queue and dashboard widget.

Drafts are local to the browser and device. They are not shared between users or machines.
