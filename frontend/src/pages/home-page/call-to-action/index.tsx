/**
 * @file src/pages/home-page/call-to-action/index.tsx
 */

import { Link } from "@/components/ui";

import styles from "./styles.module.css";

const CallToAction = () => {
  return (
    <section
      aria-labelledby="call-to-action-heading"
      className={`${styles.callToAction}`}
      id="call-to-action"
    >
      <div className={styles.container}>
        <p className={styles.callToActionText}>
          A dynamic team awaits you to work on great projects together.
        </p>
        <Link to="/jobs">Explore our job offers</Link>
      </div>
    </section>
  );
};

export default CallToAction;
