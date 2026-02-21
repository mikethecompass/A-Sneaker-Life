import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="relative bg-brand-black text-white overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-black via-brand-gray-900 to-brand-black" />

      <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28 text-center">
        {/* Avatar */}
        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-brand-gray-800 border-2 border-accent mx-auto mb-6 overflow-hidden flex items-center justify-center">
          <span className="text-3xl font-display text-accent">
            {profile.name.split(" ").map((n) => n[0]).join("")}
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl tracking-wider uppercase mb-3">
          {profile.name}
        </h1>

        <p className="text-accent font-display text-xl md:text-2xl uppercase tracking-[0.2em] mb-6">
          {profile.title}
        </p>

        <p className="text-brand-gray-400 text-base md:text-lg max-w-xl mx-auto leading-relaxed mb-10">
          {profile.tagline}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="#contact"
            className="inline-block bg-accent hover:bg-accent-dark text-white font-display
                       text-lg uppercase tracking-widest px-8 py-3.5 rounded-xl transition-colors"
          >
            Work With Me
          </a>
          <a
            href="#work"
            className="inline-block border border-white/20 hover:border-white/40 text-white font-display
                       text-lg uppercase tracking-widest px-8 py-3.5 rounded-xl transition-colors"
          >
            View My Work
          </a>
        </div>

        {/* Socials */}
        <div className="flex gap-6 justify-center mt-10">
          {profile.socials.map((s) => (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-gray-400 hover:text-accent transition-colors text-sm"
            >
              <span className="font-display uppercase tracking-wider">{s.platform}</span>
              <span className="block text-xs text-brand-gray-600">{s.followers}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
