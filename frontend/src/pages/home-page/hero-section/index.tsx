/**
 * @file src/pages/home-page/hero-section/index.tsx
 */

import { useCarousel } from "@/hooks";
import { HeroItems } from "./hero.data";
import { useRef } from "react";

import styles from "./styles.module.css";
import { Link } from "@/components/ui";
import SectionHeader from "../section-header";

function HeroSection() {
  const carouselRef = useRef<HTMLDivElement>(null);

  const { index, goNext, goPrev, goTo } = useCarousel({
    count: HeroItems.length,
    containerRef: carouselRef,
  });

  return (
    <section
      aria-labelledby="hero-heading"
      className={`${styles.hero}`}
      id="hero"
    >
      <div className={styles.container}>
        <SectionHeader
          title="Find the Right Talent. Find the Right Job."
          lead="Whether you are a recruiter searching for top candidates or a job seeker looking for your next opportunity, CareerHub connects both sides in one smart platform."
          id="hero-heading"
          as="h1"
        />

        <div
          className={styles.carouselWrap}
          aria-roledescription="carousel"
          aria-label={"Hero Items"}
          ref={carouselRef}
        >
          <div className={styles.carousel}>
            {HeroItems.map((HeroItem, i) => {
              const active = i === index;
              return (
                <article
                  className={`${styles.card} ${active ? styles.active : ""}`}
                  id={`hero-slide-${HeroItem.id}`}
                  tabIndex={active ? 0 : -1}
                  aria-hidden={!active}
                  key={HeroItem.id}
                  role="tabpanel"
                >
                  <h2 className={styles.cardHeading}>{HeroItem.heading}</h2>
                  <h3 className={styles.cardSubHeading}>
                    {HeroItem.subHeading}
                  </h3>
                  <p className={styles.cardDesc}>{HeroItem.desc}</p>
                </article>
              );
            })}
          </div>

          <div className={styles.controls}>
            <button
              onClick={goPrev}
              aria-label={"Previous slide"}
              className={styles.controlBtn}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>

            <div
              aria-label={"Hero navigation"}
              className={styles.dots}
              role="tablist"
            >
              {HeroItems.map((heroItem, i) => (
                <button
                  className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-controls={`hero-slide-${heroItem.id}`}
                  aria-selected={i === index}
                  onClick={() => goTo(i)}
                  key={heroItem.id}
                  role="tab"
                />
              ))}
            </div>

            <button
              aria-label={"Next slide"}
              className={styles.controlBtn}
              onClick={goNext}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                fill="none"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.ctaRow}>
          <Link to="/jobs">Browse Offers</Link>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
