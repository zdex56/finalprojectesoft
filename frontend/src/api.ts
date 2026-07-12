const API_URL = 'http://localhost:5005/api';

export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка регистрации');
  }

  return res.json();
}

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Ошибка входа');
  }

  return res.json();
}

export interface Task {
  id: number;
  creator_id: number;
  title: string;
  description: string | null;
  status: 'new' | 'in_progress' | 'done';
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface TaskDetail extends Task {
  assignees: UserListItem[];
}

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getTasks(status?: string, page = 1, limit = 5): Promise<Task[]> {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('limit', String(limit));

  const res = await fetch(`${API_URL}/tasks?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось загрузить задачи');
  }

  return res.json();
}

export async function deleteTask(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось удалить задачу');
  }
}

export async function createTask(title: string, description?: string, status?: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ title, description, status }),
  });

  if (!res.ok) {
    throw new Error('Не удалось создать задачу');
  }

  return res.json();
}

export async function getTaskDetail(id: number): Promise<TaskDetail> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось загрузить задачу');
  }

  return res.json();
}

export async function updateTask(
  id: number,
  data: { title: string; description?: string; status: string }): 
  Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Не удалось обновить задачу');
  }

  return res.json();
}
// Изменить статус задачи 
export async function updateTaskStatus(id: number, status: string): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    throw new Error('Не удалось обновить статус');
  }

  return res.json();
}
// добавить другого пользователя
export async function addAssignee(taskId: number, userId: number): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/assignees`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ userId }),
  });

  if (!res.ok) {
    throw new Error('Не удалось добавить исполнителя');
  }
}

// удалить другого пользователя
export async function removeAssignee(taskId: number, userId: number): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${taskId}/assignees/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось убрать исполнителя');
  }
}





export interface UserListItem {
  id: number;
  email: string;
}







export async function getUsers(): Promise<UserListItem[]> {
  const res = await fetch(`${API_URL}/users`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось загрузить пользователей');
  }

  return res.json();
}



export interface AdminUser {
  id: number;
  email: string;
  role: string;
}


// вывод и поиск пользователей ( всех по умолчанию )
export async function searchAdminUsers(search?: string): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);

  const res = await fetch(`${API_URL}/admin/users?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось загрузить пользователей');
  }

  return res.json();
}

//  все задачи конкретного чела
export async function getAdminUserTasks(userId: number): Promise<Task[]> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/tasks`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('не удалось загрузить задачи пользователя');
  }

  return res.json();
}


// сделать убрать админа
export async function updateAdminUserRole(userId: number, role: string):
 Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Не удалось изменить роль');
  }

  return res.json();
}



// редактировать эмеил пользователя
export async function updateAdminUserEmail(userId: number, email: string):
 Promise<AdminUser> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Не удалось изменить email');
  }

  return res.json();
}


// удалить пользователя за админа
export async function deleteAdminUser(userId: number):
Promise<void> {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'не удалось удалить пользователя');
  }
}
// удалить задачу будучи админом
export async function deleteAdminTask(taskId: number): Promise<void> {
  const res = await fetch(`${API_URL}/admin/tasks/${taskId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    throw new Error('Не удалось удалить задачу');
  }
}



export async function changePassword(oldPassword: string, newPassword: string):
 Promise<void> {
  const res = await fetch(`${API_URL}/auth/password`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ oldPassword, newPassword }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Не удалось сменить пароль');
  }
}