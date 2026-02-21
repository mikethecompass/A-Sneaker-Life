import { profile } from "@/data/profile";

const stats = [
  { label: "Videos Created", value: profile.stats.videosCreated },
  { label: "Avg. Views", value: profile.stats.avgViews },
  { label: "Engagement Rate", value: profile.stats.engagementRate },
  { label: "Brands", value: profile.stats.brandsWorkedWith },
];

export function Stats() {
  return (
    <section className="bg-brand-gray-900 border-y border-white/5">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-3xl md:text-4xl text-accent tracking-wider">
                {stat.value}
              </p>
              <p className="text-brand-gray-400 text-xs uppercase tracking-[0.2em] mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
