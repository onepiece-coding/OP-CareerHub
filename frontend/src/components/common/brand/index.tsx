/**
 * @file src/components/common/brand/index.tsx
 */

import { Link } from "react-router-dom";

import styles from "./styles.module.css";

const Brand = () => {
  return (
    <Link to={"/"} className={styles.brand}>
      <div className={styles.logo} aria-hidden="true">
        OP
      </div>
      <div className={styles.brandText}>
        <div className={styles.brandName}>CareerHub</div>
        <div className={styles.brandTagline}>Your Future Starts Here</div>
      </div>
    </Link>
  );
};

export default Brand;
