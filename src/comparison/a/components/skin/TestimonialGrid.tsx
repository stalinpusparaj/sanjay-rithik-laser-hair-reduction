import { useEffect, useRef } from "react";
import { ArrowRight, Quote, Star } from "lucide-react";
import { Button } from "@/comparison/a/components/ui/button";
import { testimonials } from "@/comparison/a/data/testimonials";
import { track } from "@/comparison/a/lib/analytics";
import { Reveal } from "./Reveal";

export function TestimonialGrid() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          track("testimonial_grid_viewed");
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="a-testimonials" className="section-shell bg-paper">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="max-w-3xl">
          <p className="eyebrow text-muted-foreground">Patient feedback</p>
          <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
            Skin care, in patients’ own words.
          </h2>
          <p className="mt-5 leading-relaxed text-muted-foreground">
            Read patients’ experiences with the hospital and its skin-care team.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(1, 4).map((item, index) => (
            <Reveal key={item.name} delay={index * 40}>
              <article className="flex h-full flex-col rounded-3xl border border-border bg-card p-6">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex text-clay" aria-label={`${item.rating} out of 5 stars`}>
                    {Array.from({ length: item.rating }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-3.5 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <Quote className="size-5 shrink-0 text-clay/50" aria-hidden="true" />
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  “{item.quote}”
                </p>
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{item.meta}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={120} className="mt-6">
          <p className="text-xs leading-relaxed text-muted-foreground">
            <strong>Individual results vary.</strong> Treatment suitability, sessions, recovery and
            outcomes depend on individual factors and are confirmed at consultation.
          </p>
        </Reveal>

        <Reveal
          delay={140}
          className="mt-10 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center"
        >
          <Button variant="ink" size="xl" asChild>
            <a
              href="#b-consultation"
              onClick={() => track("consultation_cta_clicked", { source: "a-testimonials" })}
            >
              Request a Consultation <ArrowRight />
            </a>
          </Button>
          <Button variant="quiet" size="xl" asChild>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Sanjay+Rithik+Baby+Care+and+Skin+Laser+Cosmetology+Hospital+Karur"
              target="_blank"
              rel="noreferrer"
              onClick={() => track("reviews_clicked")}
            >
              Read Reviews on Google
            </a>
          </Button>
        </Reveal>
      </div>
    </section>
  );
}

