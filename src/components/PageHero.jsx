import React from 'react';
import styles from './PageHero.module.css';

export default function PageHero({
  number,
  eyebrow,
  title,
  description,
}) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>

        <div className={styles.meta}>
          {number && (
            <span className={styles.number}>
              {number}
            </span>
          )}

          {number && (
            <span className={styles.divider} />
          )}

          {eyebrow && (
            <span className={styles.eyebrow}>
              {eyebrow}
            </span>
          )}
        </div>

        <div className={styles.ornament}>
          <span />
          <b>✦</b>
          <span />
        </div>

        <h1>{title}</h1>

        {description && (
          <p>{description}</p>
        )}

      </div>
    </section>
  );
}
