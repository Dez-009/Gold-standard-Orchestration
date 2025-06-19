'use client';
// Placeholder page to display a single support ticket's details

import Link from 'next/link';

export default function TicketDetailsPage({
  params
}: {
  params: { id: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-4">
      {/* Navigation back to the ticket list */}
      <Link href="/admin/support" className="self-start text-blue-600 underline">
        Back to Tickets
      </Link>
      {/* Heading showing the ticket identifier */}
      <h1 className="text-2xl font-bold">Ticket {params.id}</h1>
      {/* Informative stub content until details are implemented */}
      <p>Details view coming soon.</p>
    </div>
  );
}
