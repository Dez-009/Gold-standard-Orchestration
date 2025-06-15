'use client';
// Notes: Provide global success and error notifications using react-toastify
import { ReactNode } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Notes: Helper to show a green success toast
export function showSuccess(message: string) {
  toast.success(message);
}

// Notes: Helper to show a red error toast
export function showError(message: string) {
  toast.error(message);
}

// Notes: Wrap the application's children with the ToastContainer
export function ToastProvider({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer position="top-right" theme="colored" />
    </>
  );
}
