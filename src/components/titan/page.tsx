"use client";

import styles from "./titan.module.css";

interface TitanProps {
  title: string;
  id?: string;
  subtitle?: string;
}

export default function Titan(props: TitanProps) {
  return (
    <div className={styles.titanContainer}>
      {/* Single Elegant Neon Shadow */}
      <div className={styles.neonShadowBg} />

      <div className={styles.contentWrapper}>
        {/* Neon Shadow Behind Text */}
        <div className={styles.shadowTextWrapper}>
          <div className={styles.shadowText}>{props.title}</div>
        </div>

        <h1 className={styles.title} id={props.id}>
          {props.title}
        </h1>

        {props.subtitle && <p className={styles.subtitle}>{props.subtitle}</p>}

        {/* Decorative Neon Line */}
        <div className={styles.decorativeLine}>
          <div className={styles.lineLeft} />
          <div className={styles.centerDot} />
          <div className={styles.lineRight} />
        </div>
      </div>
    </div>
  );
}
