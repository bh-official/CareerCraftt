"use client"

export default function Error({ error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
      <p className="text-zinc-400">{error.message}</p>
    </div>
  );
}