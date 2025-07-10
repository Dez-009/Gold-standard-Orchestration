// Generic authentication form component used for login and registration
// Accepts dynamic fields and handles submission through a callback

'use client';
import { useState } from 'react';

// Definition of a form field the component will render
interface Field {
  name: string;
  label: string;
  type: string;
  required?: boolean; // Indicates if the input must be filled in
}

interface AuthFormProps {
  fields: Field[]; // Fields to display
  submitText: string; // Button text
  onSubmit: (values: Record<string, string>) => Promise<void>; // Handler called on form submit
}

export default function AuthForm({ fields, submitText, onSubmit }: AuthFormProps) {
  // Local state to store user input values
  const [values, setValues] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  // Update state when inputs change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(values); // Call provided handler
      setMessage('Success');
    } catch (error: any) {
      // Debug: Log the full error structure to console
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      
      // Extract error message from backend response
      let errorMessage = 'Something went wrong';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        console.error('Detail object:', detail);
        
        // Handle validation error array from FastAPI
        if (Array.isArray(detail)) {
          errorMessage = detail.map(err => {
            console.error('Processing error item:', err);
            if (typeof err === 'object' && err.msg) {
              return err.msg;
            }
            return typeof err === 'string' ? err : 'Validation error';
          }).join(', ');
        }
        // Handle validation error object
        else if (typeof detail === 'object' && detail.msg) {
          errorMessage = detail.msg;
        }
        // Handle string error message
        else if (typeof detail === 'string') {
          errorMessage = detail;
        }
        // Handle any other object by converting to string safely
        else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      }
      // Additional fallback for direct error messages
      else if (error.response?.data?.message) {
        errorMessage = String(error.response.data.message);
      }
      else if (error.message) {
        errorMessage = String(error.message);
      }
      
      // Ensure we always have a string
      if (typeof errorMessage !== 'string') {
        errorMessage = 'An error occurred';
      }
      
      console.error('Final error message:', errorMessage);
      setMessage(errorMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm w-full">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col">
          <label htmlFor={field.name} className="mb-1 font-medium">
            {field.label}
          </label>
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            onChange={handleChange}
            // Notes: Inputs default to required unless explicitly set false
            required={field.required !== false}
            className="border rounded p-2"
          />
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {submitText}
      </button>
      {message && <p className="text-center text-sm">{message}</p>}
    </form>
  );
}
