import { profile } from "@/data/profile";

export function About() {
  return (
    <section className="bg-brand-black py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="section-heading text-brand-gray-400">About</p>
        <h2 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wider mb-8">
          {profile.name}
        </h2>
        <p className="text-brand-gray-400 text-base md:text-lg leading-relaxed mb-8">
          {profile.bio}
        </p>

        {/* Platforms */}
        <div className="flex flex-wrap gap-4 justify-center">
          {profile.socials.map((s) => (
            <a
              key={s.platform}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 border border-white/10 rounded-full px-5 py-2.5
                         hover:border-accent/40 transition-colors group"
            >
              <span className="text-white font-display uppercase tracking-wider text-sm">
                {s.platform}
              </span>
              <span className="text-brand-gray-600 text-xs">{s.handle}</span>
              <span className="text-accent text-xs font-medium">{s.followers}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
