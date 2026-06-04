/**
 * @file src/pages/home-page/how-does-it-work/index.tsx
 */

import { HowDoesItWorkItems } from "./how-does-it-work.data";

import SectionHeader from "../section-header";
import styles from "./styles.module.css";

const HowDoesItWork = () => {
  return (
    <section
      aria-labelledby="how-does-it-work-heading"
      className={`${styles.howDoesItWork}`}
      id="how-does-it-work"
    >
      <div className={styles.container}>
        <SectionHeader
          title="How does it work?"
          lead="Tip: Update your CV before applying!"
          id="how-does-it-work-heading"
        />

        <div className={styles.howDoesItWorkGrid}>
          {HowDoesItWorkItems.map((item) => (
            <div key={item.id} className={styles.card}>
              <div className={styles.cardInner}>
                <div className={styles.overlayTrack} aria-hidden="true">
                  <div className={styles.overlayFill}></div>
                </div>
                <div className={styles.stepBadge} aria-hidden="true">
                  {item.id}
                </div>
                <div className={styles.iconWrap} aria-hidden="true">
                  <item.Icon />
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.desc}</p>
                  <div className={styles.accentBar} aria-hidden="true"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowDoesItWork;
