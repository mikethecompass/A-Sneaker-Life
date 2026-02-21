import { profile } from "@/data/profile";

export function Services() {
  return (
    <section className="bg-brand-gray-900 py-16 md:py-24 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <p className="section-heading text-brand-gray-400">What I Do</p>
          <h2 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wider">
            Services
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
          {profile.services.map((service) => (
            <div
              key={service.title}
              className="bg-brand-black border border-white/5 rounded-2xl p-6 hover:border-accent/30 transition-colors"
            >
              <h3 className="font-display text-xl text-white uppercase tracking-wider mb-2">
                {service.title}
              </h3>
              <p className="text-brand-gray-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
