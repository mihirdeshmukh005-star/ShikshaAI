# EduReal AI — Your Personal AI Teacher

A frontend-only, fully interactive prototype of an AI education platform. Built with
React, Vite, Tailwind CSS, Framer Motion, and Lucide icons. No backend, no real AI
calls — every interaction is simulated on the client.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL. Build for production with `npm run build`.

## 1. Project structure

```
src/
  assets/                 teacher-hero.jpg, teacher-stage.jpg (replaceable)
  components/
    Logo.jsx, Brand.jsx    shared logo + wordmark
    landing/                Navbar, Hero, FeatureCard, DemoModal, StatsBar,
                             HowItWorks, Footer
    classroom/              Sidebar, StreakCard, UserProfile, ClassroomHeader,
                             TeacherStage, VideoControls, TopicProgress,
                             QuickActionCard, ChatPanel, ChatMessage,
                             AudioMessage, TypingIndicator, ChatInput, NotesPanel
  data/mockData.js         all mock content (lesson, chat, streak, nav, copy)
  pages/
    Landing.jsx             route: /
    Classroom.jsx           route: /classroom  (chat state + simulated AI lives here)
  App.jsx                   React Router routes
```

## 2. Components created

Two component families — `landing/*` and `classroom/*` — plus two shared
components (`Logo`, `Brand`). Each is a small, single-purpose file; the two page
files compose them and own the interactive state (chat messages, tabs, drawers,
fullscreen, mic/camera toggles).

## 3. Landing → Classroom transition

Every primary CTA ("Start Learning", "Get Started" in the navbar) calls
`navigate('/classroom')` from `react-router-dom`. `App.jsx` mounts `Landing` at
`/` and `Classroom` at `/classroom` inside a `BrowserRouter`. Entry animations on
the classroom page (teacher stage fade/scale-in, progress bar fill, staggered
streak checkmarks) give the arrival its own sense of motion without a manual
route-transition wrapper.

## 4. Replacing the teacher / classroom imagery

Drop new files into `src/assets/` using the same names and they'll be picked
up automatically:

- `teacher-hero.jpg` — landing page hero background (teacher + chalkboard quote)
- `teacher-stage.jpg` — classroom "presentation stage" background (teacher +
  Newton's Second Law board)

Both are plain `<img>` elements with `object-cover`, so any reasonably similar
aspect ratio will drop in cleanly. If you'd rather host on `/public/assets/`,
update the two `import teacherHero/teacherStage from ...` lines in
`Hero.jsx`, `DemoModal.jsx`, and `TeacherStage.jsx` to reference the public
path instead.

## 5. How the simulated AI works

There is no network call anywhere in the app. `src/pages/Classroom.jsx` holds
`messages` in React state, seeded from `initialMessages` in `mockData.js`.

- Typing in the chat input or the "Ask your doubt" bar and sending appends a
  user message, flips on a typing indicator, then (after a randomized ~1.1–1.6s
  delay) appends a generic AI reply with a simulated audio-response bubble.
- Clicking a Quick Action card ("Explain Again", "Make it Simpler", "Give an
  Example", "Go Deeper") appends that action's title as a user message and
  replies with the matching canned response defined in `quickActions` inside
  `mockData.js` — swap those strings to change what the "teacher" says.
- The Notes tab is static content from `lessonNotes` in `mockData.js`; Save/Copy/Edit
  buttons show local success states only.

Everything — streak days, nav items, stats, feature card copy — lives in
`src/data/mockData.js`, so content can be edited without touching component code.
