import { useEffect, useRef } from "react";
import { Quote, Star } from "lucide-react";
import { testimonials } from "@/comparison/b/data/testimonials";
import { track } from "@/comparison/b/lib/analytics";
import { Reveal } from "./Reveal";

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={className} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={index < rating ? "fill-current" : "opacity-25"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

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
    <section ref={sectionRef} id="b-testimonials" className="section-shell bg-paper review-section">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal className="review-header">
          <div>
            <p className="section-pill">Google reviews about the hospital</p>
            <h2 className="mt-5 text-4xl leading-[1.04] sm:text-5xl">
              What do patients say about their visit in Karur?
            </h2>
          </div>
          <a
            className="review-rating-box"
            href="https://www.google.com/maps/search/?api=1&query=Sanjay+Rithik+Baby+Care+and+Skin+Laser+Cosmetology+Hospital+Karur"
            target="_blank"
            rel="noreferrer"
            onClick={() => track("google_reviews_clicked", { source: "testimonials" })}
          >
            <Stars rating={5} className="review-rating-stars" />
            <span>
              <strong>4.5 / 5 on Google</strong> · 447 reviews
            </span>
          </a>
        </Reveal>

        <ul className="review-card-grid mt-12" aria-label="Patient reviews">
          {testimonials.slice(0, 6).map((item, index) => (
            <li key={item.name}>
              <Reveal delay={index * 40} className="h-full">
                <article className="review-card">
                  <Quote className="review-card-quote" aria-hidden="true" />
                  <p className="review-card-text">{item.quote}</p>
                  <div className="review-card-footer">
                    <div>
                      <p className="review-card-name">{item.name}</p>
                      <p className="review-card-meta">
                        {item.meta}
                        {item.timeAgo ? ` · ${item.timeAgo}` : ""}
                      </p>
                    </div>
                    <Stars rating={item.rating} className="review-card-stars" />
                  </div>
                </article>
              </Reveal>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
