'use client';
// Landing page presenting marketing info about Vida Coach
// Includes hero, feature highlights, testimonials placeholder, pricing placeholder, and footer links
import Link from 'next/link';

export default function LandingPage() {
  // Notes: card items describing product features
  const features = [
    { title: 'Daily Coaching Sessions', description: 'Short interactive chats keep you on track every day.' },
    { title: 'AI-Generated Weekly Reviews', description: 'See your progress summarized automatically each week.' },
    { title: 'Micro-Goal Tracking', description: 'Break big ambitions into tiny achievable steps.' },
    { title: 'Personalized Growth Plans', description: 'Custom action plans adapt to your goals and lifestyle.' }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section introducing the product */}
      <section className="flex flex-col items-center justify-center flex-1 text-center bg-gradient-to-b from-blue-600 to-blue-800 text-white p-8 space-y-4">
        <h1 className="text-4xl font-bold">Your Personal AI Life Coach</h1>
        <p className="text-lg">Accountability, progress, and real-life coaching — powered by AI.</p>
        <Link href="/register" className="bg-white text-blue-800 px-6 py-3 rounded font-semibold shadow hover:bg-gray-100">
          Join the Beta
        </Link>
      </section>

      {/* Feature cards highlighting key functionality */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 max-w-4xl mx-auto">
        {features.map(({ title, description }) => (
          <div key={title} className="border rounded-lg p-6 shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p>{description}</p>
          </div>
        ))}
      </section>

      {/* Testimonials placeholder section */}
      <section className="bg-gray-50 p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Testimonials</h2>
        <p className="text-gray-600">Real stories from early users will appear here.</p>
      </section>

      {/* Pricing placeholder section */}
      <section className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Pricing</h2>
        <p className="text-gray-600">Plans and pricing will be announced soon.</p>
      </section>

      {/* Footer with links */}
      <footer className="mt-auto bg-gray-800 text-white p-4 text-center space-x-4">
        <Link href="/privacy" className="underline">
          Privacy Policy
        </Link>
        <Link href="/terms" className="underline">
          Terms
        </Link>
        <Link href="/contact" className="underline">
          Contact
        </Link>
      </footer>
    </div>
  );
}
