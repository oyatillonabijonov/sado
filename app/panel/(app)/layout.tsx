import { requireUser } from '@/panel/auth';
import { Nav } from './Nav';

/**
 * Everything behind the login. The route group adds no URL segment, so this
 * wraps `/panel`, `/panel/<your-screens>`, … while `/panel/login` and
 * `/panel/boshlash` stay outside it and render bare.
 *
 * The guard is here rather than in `proxy.ts` deliberately: the proxy runs
 * before the database and could only check that a cookie exists, not that it
 * still decodes to a user. One `requireUser()` at the top of the tree covers
 * every screen under it. **Each server action repeats it** — an action is its
 * own HTTP entry point and is reachable without ever rendering the page that
 * contains it.
 */
export default async function PanelAppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-dvh flex-col bg-white lg:flex-row">
      <aside className="shrink-0 lg:sticky lg:top-0 lg:h-dvh lg:w-[264px]">
        <Nav email={user.email} />
      </aside>
      {/* Capped and left-aligned: an editor stretched across a 27" display is
          the sparsest a screen can look. */}
      <main className="min-w-0 flex-1 px-4 py-10 lg:px-12 lg:py-14">
        <div className="mx-auto w-full max-w-[76rem]">{children}</div>
      </main>
    </div>
  );
}
