import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="container-pad py-16">
      <div className="glass metal-border rounded-[2rem] p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.4em] text-electric/70">Terms and privacy</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Visitor notice</h1>
        <div className="mt-8 space-y-6 text-sm leading-7 text-white/75">
          <p>
            This portfolio may collect visitor analytics only after you accept cookies. The data can include IP
            address, inferred location, page path, device information, and referrer.
          </p>
          <p>
            The purpose of this logging is to understand traffic patterns, monitor reach, and keep a lightweight
            record of anonymous visits in the admin portal.
          </p>
          <p>
            If you reject analytics cookies, the site will not store visitor IP or location data for tracking.
          </p>
          <p>
            By continuing to browse after accepting, you agree to this limited tracking for portfolio analytics only.
          </p>
        </div>
        <div className="mt-8">
          <Link href="/" className="rounded-full bg-white px-5 py-3 text-sm font-medium text-black transition hover:scale-[1.02]">
            Back to portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}

