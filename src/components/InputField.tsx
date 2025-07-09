// src/components/InputField.tsx
import { InputHTMLAttributes } from 'react';

type Props = {
  label: string;
  name: string;
  error?: string;
} & InputHTMLAttributes<HTMLInputElement>;

export default function InputField({ label, name, error, ...rest }: Props) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold mb-1" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        {...rest}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-indigo-500"
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
}
