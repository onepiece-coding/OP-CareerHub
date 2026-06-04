/**
 * @file src/pages/home-page/who-can-register/index.tsx
 */

import { WhoCanRegisterItems } from "./who-can-register.data";

import SectionHeader from "../section-header";
import styles from "./styles.module.css";

const WhoCanRegister = () => {
  return (
    <section
      aria-labelledby="who-can-register-heading"
      className={`${styles.WhoCanRegister}`}
      id="who-can-register"
    >
      <div className={styles.container}>
        <SectionHeader
          title="Who can register?"
          lead="Lorem Ipsum is simply dummy text of the printing"
          id="who-can-register-heading"
        />

        <div className={styles.whoCanRegisterRow}>
          {WhoCanRegisterItems.map((item) => (
            <div key={item.id} className={styles.whoCanRegisterCard}>
              <img src={item.image} alt={item.title} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoCanRegister;
