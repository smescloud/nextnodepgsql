'use client';

import React, { useEffect, useState } from 'react';
import CardComponent from './components/CardComponent';
import UserForm, { UserDraft } from './components/UserForm';

interface User {
  id: number;
  name: string;
  email: string;
}

const emptyForm: UserDraft = {
  name: '',
  email: '',
};

function sortUsers(users: User[]) {
  return [...users].sort((left, right) => right.id - left.id);
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });

  let payload: unknown = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string'
        ? payload.message
        : 'The request could not be completed.';

    throw new Error(message);
  }

  return payload as T;
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [createForm, setCreateForm] = useState<UserDraft>(emptyForm);
  const [editForm, setEditForm] = useState<UserDraft>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [busyUserId, setBusyUserId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  const loadUsers = async (initialLoad = false) => {
    if (initialLoad) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError(null);

    try {
      const data = await requestJson<User[]>('/api/users');
      setUsers(sortUsers(data));
      setBackendOnline(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to load users right now.';

      setUsers([]);
      setBackendOnline(false);
      setError(message);
    } finally {
      if (initialLoad) {
        setLoading(false);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    void loadUsers(true);
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const createdUser = await requestJson<User>('/api/users', {
        method: 'POST',
        body: JSON.stringify(createForm),
      });

      setUsers((currentUsers) => sortUsers([createdUser, ...currentUsers]));
      setCreateForm(emptyForm);
      setBackendOnline(true);
      setFeedback(`Created ${createdUser.name}.`);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to create the user.';

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (user: User) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name,
      email: user.email,
    });
    setError(null);
    setFeedback(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm(emptyForm);
  };

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (editingId === null) {
      return;
    }

    setBusyUserId(editingId);
    setError(null);
    setFeedback(null);

    try {
      const updatedUser = await requestJson<User>(`/api/users/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify(editForm),
      });

      setUsers((currentUsers) =>
        sortUsers(
          currentUsers.map((user) => (user.id === editingId ? updatedUser : user)),
        ),
      );
      setBackendOnline(true);
      setFeedback(`Updated ${updatedUser.name}.`);
      cancelEditing();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to update the user.';

      setError(message);
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDelete = async (user: User) => {
    const shouldDelete = window.confirm(`Delete ${user.name}?`);

    if (!shouldDelete) {
      return;
    }

    setBusyUserId(user.id);
    setError(null);
    setFeedback(null);

    try {
      await requestJson<User>(`/api/users/${user.id}`, {
        method: 'DELETE',
      });

      setUsers((currentUsers) =>
        currentUsers.filter((currentUser) => currentUser.id !== user.id),
      );
      setBackendOnline(true);
      setFeedback(`Deleted ${user.name}.`);

      if (editingId === user.id) {
        cancelEditing();
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete the user.';

      setError(message);
    } finally {
      setBusyUserId(null);
    }
  };

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur xl:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-medium uppercase tracking-[0.32em] text-teal-700">
                Next.js + Node.js + Postgres
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                User CRUD dashboard with a stable hosted deployment path.
              </h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                The AI text parser has been replaced with a direct CRUD interface.
                The frontend now uses server-side API proxy routes, so the hosted
                app no longer depends on browser-side environment variables to
                reach the backend.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[24px] bg-slate-950 px-5 py-4 text-white shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
                <div className="text-xs uppercase tracking-[0.28em] text-teal-300">
                  Backend
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {backendOnline === null
                    ? 'Checking'
                    : backendOnline
                      ? 'Connected'
                      : 'Unavailable'}
                </div>
                <p className="mt-2 text-sm text-slate-300">
                  Requests are sent to the frontend at <code>/api</code> and
                  proxied to the Node service internally.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/80 bg-[var(--surface-strong)] px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
                <div className="text-xs uppercase tracking-[0.28em] text-amber-700">
                  Records
                </div>
                <div className="mt-2 text-3xl font-semibold text-slate-950">
                  {users.length.toString().padStart(2, '0')}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Live users currently available from Postgres.
                </p>
              </div>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 shadow-[0_12px_32px_rgba(185,28,28,0.08)]">
            {error}
          </div>
        ) : null}

        {feedback ? (
          <div className="rounded-[22px] border border-teal-200 bg-teal-50 px-5 py-4 text-sm text-teal-700 shadow-[0_12px_32px_rgba(15,118,110,0.08)]">
            {feedback}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px,minmax(0,1fr)]">
          <UserForm
            title="Create a user"
            description="Add a new record to the Postgres-backed user table."
            values={createForm}
            submitLabel={submitting ? 'Creating...' : 'Create user'}
            submitting={submitting}
            onChange={(field, value) =>
              setCreateForm((currentForm) => ({
                ...currentForm,
                [field]: value,
              }))
            }
            onSubmit={handleCreate}
          />

          <div className="rounded-[32px] border border-white/60 bg-[var(--surface)] p-5 shadow-[0_28px_80px_rgba(15,23,42,0.08)] backdrop-blur sm:p-6">
            <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-teal-700">
                  Directory
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Existing users
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Update or delete any row without leaving the page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadUsers()}
                disabled={loading || refreshing}
                className="inline-flex w-fit items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {refreshing ? 'Refreshing...' : 'Refresh data'}
              </button>
            </div>

            {loading ? (
              <div className="mt-6 grid gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-[24px] border border-white/70 bg-white/70"
                  />
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-white/75 px-5 py-10 text-center">
                <p className="text-lg font-medium text-slate-900">
                  No users have been created yet.
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Use the form on the left to insert the first record.
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-4">
                {users.map((user) =>
                  editingId === user.id ? (
                    <UserForm
                      key={user.id}
                      title={`Edit user #${user.id}`}
                      description="Save your changes directly to the backend API."
                      values={editForm}
                      submitLabel={
                        busyUserId === user.id ? 'Saving...' : 'Save changes'
                      }
                      submitting={busyUserId === user.id}
                      onChange={(field, value) =>
                        setEditForm((currentForm) => ({
                          ...currentForm,
                          [field]: value,
                        }))
                      }
                      onSubmit={handleUpdate}
                      onCancel={cancelEditing}
                    />
                  ) : (
                    <CardComponent
                      key={user.id}
                      user={user}
                      disabled={busyUserId === user.id}
                      onEdit={startEditing}
                      onDelete={handleDelete}
                    />
                  ),
                )}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
