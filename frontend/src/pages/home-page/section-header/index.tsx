/**
 * @file src/pages/home-page/section-header/index.tsx
 */

import styles from "./styles.module.css";

type HeadingLevel = "h1" | "h2" | "h3";

interface SectionHeaderProps {
  as?: HeadingLevel;
  title: string;
  lead: string;
  id: string;
}

const SectionHeader = ({
  title,
  lead,
  id,
  as: Tag = "h2",
}: SectionHeaderProps) => {
  return (
    <header className={styles.header}>
      <Tag id={id} className={styles.title}>
        {title}
      </Tag>
      <p className={styles.lead}>{lead}</p>
    </header>
  );
};

export default SectionHeader;
