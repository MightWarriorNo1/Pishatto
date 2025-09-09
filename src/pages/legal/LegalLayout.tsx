import React from 'react';

type LegalLayoutProps = {
  title: string;
  children: React.ReactNode;
};

const LegalLayout: React.FC<LegalLayoutProps> = ({ title, children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-primary via-primary/80 to-secondary text-white">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

      {/* Top header with back button */}
      <div className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto w-full max-w-3xl px-6 py-4">
          <button
            type="button"
            onClick={() => { if (window.history.length > 1) { window.history.back(); } else { window.location.href = '/'; } }}
            className="text-white/80 hover:text-white text-sm underline"
            aria-label="戻る"
          >
            ← 戻る
          </button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6 py-12">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
          <h1 className="text-2xl font-bold mb-6 text-center">{title}</h1>
          <article className="prose prose-sm max-w-none text-white/90">
            {children}
          </article>
        </div>
      </div>
    </div>
  );
};

export default LegalLayout;


