"use client";

import styles from "./titan.module.css";

interface TitanProps {
  title: string;
  id?: string;
  subtitle?: string;
}

export default function Titan(props: TitanProps) {
  return (
    <div className={styles.titanContainer} suppressHydrationWarning>
      {/* Single Elegant Neon Shadow */}
      <div className={styles.neonShadowBg} suppressHydrationWarning></div>

      <div className={styles.contentWrapper} suppressHydrationWarning>
        {/* Neon Shadow Behind Text */}
        <div className={styles.shadowTextWrapper} suppressHydrationWarning>
          <div className={styles.shadowText} suppressHydrationWarning>
            {props.title}
          </div>
        </div>

        <h1 className={styles.title} id={props.id} suppressHydrationWarning>
          {props.title}
        </h1>

        {props.subtitle && (
          <p className={styles.subtitle} suppressHydrationWarning>
            {props.subtitle}
          </p>
        )}

        {/* Decorative Neon Line */}
        <div className={styles.decorativeLine} suppressHydrationWarning>
          <div className={styles.lineLeft} suppressHydrationWarning />
          <div className={styles.centerDot} suppressHydrationWarning />
          <div className={styles.lineRight} suppressHydrationWarning />
        </div>
      </div>
    </div>
  );
}
