/**
 * @file src/components/common/info-card/index.tsx
 */

import type { IconProps } from "@/components/icons";

import styles from "./styles.module.css";

interface InfoCardProps {
  IconComponent: React.ComponentType<IconProps>;
  title: string;
  desc: string;
}

const InfoCard = ({ IconComponent, title, desc }: InfoCardProps) => {
  return (
    <div className={styles["info-card"]}>
      <div className={styles["info-card__icon-container"]} aria-hidden="true">
        <IconComponent className={styles["info-card__icon"]} />
      </div>
      <div className={styles["info-card__text"]}>
        <span>{title}</span>
        <p>{desc}</p>
      </div>
    </div>
  );
};

export default InfoCard;
