import type { StoredEvent, UnifiedStore } from '../state/unified-store.js';
import type { Work } from './types.js';

interface WorkEvent {
  kind: 'work';
  workId: string;
  work: Work;
}

export async function saveWork(
  store: UnifiedStore,
  projectsDir: string,
  slug: string,
  work: Work
): Promise<void> {
  const event: WorkEvent = {
    kind: 'work',
    workId: work.id,
    work: structuredClone(work),
  };

  await store.appendTimeline(projectsDir, slug, event);
}

export async function loadWork(
  store: UnifiedStore,
  projectsDir: string,
  slug: string,
  workId: string
): Promise<Work | undefined> {
  const events = await store.query(
    projectsDir,
    slug,
    'timeline',
    (event: StoredEvent) => {
      const data = event.data as Partial<WorkEvent>;
      return data.kind === 'work' && data.workId === workId;
    },
    1
  );

  const latest = events[0];
  if (!latest) return undefined;

  const data = latest.data as WorkEvent;
  return structuredClone(data.work);
}
