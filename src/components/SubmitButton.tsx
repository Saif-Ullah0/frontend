// src/components/SubmitButton.tsx
export default function SubmitButton({ loading, label }: { loading: boolean; label: string }) {
  return (
    <button
      type="submit"
      className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
      disabled={loading}
    >
      {loading ? 'Loading...' : label}
    </button>
  );
}
