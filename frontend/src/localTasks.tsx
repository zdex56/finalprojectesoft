export interface LocalTask {
  id: string;
  title: string;
  description: string;
  status: 'new' | 'in_progress' | 'done';
  createdAt: string;
}

const STORAGE_KEY = 'stacy_guest_tasks';

function readAll(): LocalTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as LocalTask[]) : [];
  } catch {
    return [];
  }
}

function writeAll(tasks: LocalTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

export function getLocalTasks(): LocalTask[] {
  return readAll().sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createLocalTask(title: string, description: string, status: string): LocalTask {
  const task: LocalTask = {
    id: crypto.randomUUID(),
    title,
    description,
    status: (status as LocalTask['status']) || 'new',
    createdAt: new Date().toISOString(),
  };
  const tasks = readAll();
  tasks.push(task);
  writeAll(tasks);
  return task;
}

export function updateLocalTask(
  id: string,
  updates: Partial<Pick<LocalTask, 'title' | 'description' | 'status'>>
): void {
  const tasks = readAll();
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx !== -1) {
    tasks[idx] = { ...tasks[idx], ...updates };
    writeAll(tasks);
  }
}

export function deleteLocalTask(id: string): void {
  writeAll(readAll().filter((t) => t.id !== id));
}