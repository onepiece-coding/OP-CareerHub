/**
 * @file src/components/common/footer/index.tsx
 */

import { BUILD_YEAR } from "@/lib/build-info";

import styles from "./styles.module.css";

const Footer = () => {
  return (
    <footer className={styles.footerContainer} aria-label={"Site footer"}>
      <div className="container">
        <div className={styles.copyright}>
          <p>© {BUILD_YEAR} CareerHub - All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
