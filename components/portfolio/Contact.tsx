import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section id="contact" className="bg-brand-gray-900 py-16 md:py-24 border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <p className="section-heading text-brand-gray-400">Let&apos;s Work Together</p>
        <h2 className="font-display text-4xl md:text-5xl text-white uppercase tracking-wider mb-4">
          Book Me
        </h2>
        <p className="text-brand-gray-400 text-base md:text-lg max-w-lg mx-auto mb-10">
          Interested in UGC for your brand? Reach out and let&apos;s create content that converts.
        </p>

        <a
          href={`mailto:${profile.email}?subject=UGC Collaboration Inquiry`}
          className="inline-block bg-accent hover:bg-accent-dark text-white font-display
                     text-lg uppercase tracking-widest px-10 py-4 rounded-xl transition-colors mb-6"
        >
          Get In Touch
        </a>

        <p className="text-brand-gray-600 text-sm">
          or email me directly at{" "}
          <a href={`mailto:${profile.email}`} className="text-accent hover:underline">
            {profile.email}
          </a>
        </p>

        {/* Quick info */}
        <div className="mt-12 flex flex-wrap gap-6 justify-center text-sm text-brand-gray-400">
          <span>Based in {profile.location}</span>
          <span className="text-brand-gray-800">|</span>
          <span>Available for paid collaborations</span>
          <span className="text-brand-gray-800">|</span>
          <span>Quick turnaround</span>
        </div>
      </div>
    </section>
  );
}
