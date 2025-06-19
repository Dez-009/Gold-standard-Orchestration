// Simple landing page
// Main page component with basic content.
import Link from 'next/link';
export default function Home() {
  // Landing page with link to the dashboard
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h1 className="text-2xl font-bold">Vida Coach Frontend</h1>
      <Link href="/dashboard" className="text-blue-600 underline">
        Go to Dashboard
      </Link>
    </div>
  );
}
