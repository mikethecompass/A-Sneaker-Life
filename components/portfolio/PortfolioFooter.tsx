import { profile } from "@/data/profile";

export function PortfolioFooter() {
  return (
    <footer className="bg-brand-black border-t border-white/5 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-display text-white text-lg uppercase tracking-wider">
            {profile.name}
          </p>

          <div className="flex gap-6">
            {profile.socials.map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gray-600 hover:text-accent transition-colors text-sm font-display uppercase tracking-wider"
              >
                {s.platform}
              </a>
            ))}
          </div>

          <p className="text-brand-gray-800 text-xs">
            &copy; {new Date().getFullYear()} {profile.name}
          </p>
        </div>
      </div>
    </footer>
  );
}
