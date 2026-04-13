import React from 'react';

interface UserCard {
  id: number;
  name: string;
  email: string;
}

interface CardComponentProps {
  user: UserCard;
  disabled?: boolean;
  onEdit: (user: UserCard) => void;
  onDelete: (user: UserCard) => void;
}

const CardComponent: React.FC<CardComponentProps> = ({
  user,
  disabled = false,
  onEdit,
  onDelete,
}) => {
  return (
    <article className="rounded-[24px] border border-white/80 bg-white/90 p-5 shadow-[0_22px_48px_rgba(15,23,42,0.08)]">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="inline-flex w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-teal-700">
            User #{user.id}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">{user.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{user.email}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onEdit(user)}
            disabled={disabled}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            disabled={disabled}
            className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
};

export default CardComponent;
