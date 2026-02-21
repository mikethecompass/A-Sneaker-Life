import { Hero } from "@/components/portfolio/Hero";
import { Stats } from "@/components/portfolio/Stats";
import { VideoGrid } from "@/components/portfolio/VideoGrid";
import { Services } from "@/components/portfolio/Services";
import { About } from "@/components/portfolio/About";
import { Contact } from "@/components/portfolio/Contact";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <VideoGrid />
      <Services />
      <About />
      <Contact />
    </>
  );
}
