import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';

import kingdom from '@site/src/data/kingdom';

/* =========================================================
   HERO IMAGES
   ========================================================= */

const heroImages = [
  '/cabo-norte-site/img/cabonorte/hero/hero-01.jpg',
  '/cabo-norte-site/img/cabonorte/hero/hero-02.jpg',
  '/cabo-norte-site/img/cabonorte/hero/hero-03.jpg',
  '/cabo-norte-site/img/cabonorte/hero/hero-04.jpg',
];

/* =========================================================
   ICONS
   ========================================================= */

function DiscordIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M17 17c10-5 20-5 30 0 4 7 6 15 6 24-8 6-15 8-21 8s-13-2-21-8c0-9 2-17 6-24Z" />
      <circle cx="25" cy="32" r="2.6" />
      <circle cx="39" cy="32" r="2.6" />
      <path d="M24 42c5 3 11 3 16 0" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="22" />
      <path d="M35 20h-5c-3 0-5 2-5 6v6h-5v6h5v12h7V38h6l1-6h-7v-5c0-1 1-1 2-1h6z" />
    </svg>
  );
}

function ForumIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M10 13h44v31H24L13 53v-9h-3z" />
      <path d="M20 24h24M20 32h17" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <rect x="10" y="17" width="44" height="30" rx="6" />
      <path d="M28 25l12 7-12 7z" />
    </svg>
  );
}

function CitizensIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="24" cy="22" r="6" />
      <circle cx="42" cy="24" r="5" />
      <path d="M12 49c1-9 5-14 12-14s11 5 12 14" />
      <path d="M37 37c6 0 11 4 12 12" />
    </svg>
  );
}

function ActsIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M17 10h30v44H17z" />
      <path d="M24 20h16M24 29h16M24 38h11M24 47h16" />
    </svg>
  );
}

function DiplomacyIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 20h18v24H12zM34 20h18v24H34z" />
      <path d="M30 25h4M30 39h4M19 27h4M41 27h4" />
    </svg>
  );
}

function DistrictIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M12 16h40v32H12z" />
      <path d="M20 24h24M20 32h24M20 40h15" />
    </svg>
  );
}

/* =========================================================
   COMMUNITY
   ========================================================= */

const communityCards = [
  {
    title: 'Discord',
    description: 'Official community',
    status: 'Available',
    Icon: DiscordIcon,
    href: null,
  },
  {
    title: 'Facebook',
    description: 'Official page',
    status: 'Coming soon',
    Icon: FacebookIcon,
    href: null,
  },
  {
    title: 'Forum',
    description: 'Public discussion and participation',
    status: 'Coming soon',
    Icon: ForumIcon,
    href: null,
  },
  {
    title: 'YouTube',
    description: 'Official audiovisual presence',
    status: 'Coming soon',
    Icon: YoutubeIcon,
    href: null,
  },
];

/* =========================================================
   THE KINGDOM TODAY
   ========================================================= */

const todayStats = [
  {
    label: 'Citizens',
    value: kingdom.citizens,
    Icon: CitizensIcon,
  },
  {
    label: 'Public Acts',
    value: kingdom.publicActs,
    Icon: ActsIcon,
  },
  {
    label: 'Diplomatic Relations',
    value: kingdom.diplomaticRelations,
    Icon: DiplomacyIcon,
  },
  {
    label: 'Active Districts',
    value: kingdom.activeDistricts,
    Icon: DistrictIcon,
  },
];

export default function Home() {
  const [activeHero, setActiveHero] = useState(0);

  useEffect(() => {
    heroImages.forEach((src) => {
      const image = new Image();
      image.src = src;
    });

    const interval = setInterval(() => {
      setActiveHero(
        (current) =>
          (current + 1) % heroImages.length
      );
    }, 9000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout
      title="Kingdom of Cabo Norte"
      description="The Kingdom of Cabo Norte — Labor et Mare."
    >
      <main>

        {/* =====================================================
            HERO
            ===================================================== */}

        <section className={styles.hero}>

          <div className={styles.heroBackgrounds}>
            {heroImages.map((image, index) => (
              <div
                key={image}
                className={`${styles.heroBackground} ${
                  index === activeHero
                    ? styles.heroBackgroundActive
                    : ''
                }`}
                style={{
                  backgroundImage: `url("${image}")`,
                }}
                aria-hidden={index !== activeHero}
              />
            ))}
          </div>

          <div className={styles.heroOverlay} />

          <aside
            className={styles.heroRail}
            aria-hidden="true"
          >
            <div className={styles.railBorderLeft} />
            <div className={styles.railBorderRight} />

            <div className={styles.heroRailInner}>
              <img
                src="/cabo-norte-site/img/cabonorte/teixo-vazado.png"
                alt=""
                className={styles.railTeixo}
              />
            </div>
          </aside>

          <div className={styles.heroContent}>
            <div className={styles.heroCopy}>

              <div className={styles.heroKicker}>
                KINGDOM OF CABO NORTE
              </div>

              <h1>Cabo Norte</h1>

              <div className={styles.heroMotto}>
                <span className={styles.mottoLine} />
                <em>Labor et Mare</em>
                <span className={styles.mottoLine} />
              </div>

              <p className={styles.heroDescription}>
                A digital micronation and voluntary political
                community, organized under its Fundamental Charter
                and developed according to the principle of
                organicity.
              </p>

              <div className={styles.heroActions}>

                <Link
                  className={styles.heroButton}
                  to="/o-reino"
                >
                  <span>Discover Cabo Norte</span>
                  <span>→</span>
                </Link>

                <Link
                  className={styles.heroButton}
                  to="/docs/carta-fundamental/carta"
                >
                  <span>Read the Fundamental Charter</span>
                  <span>→</span>
                </Link>

              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            AT A GLANCE
            ===================================================== */}

        <section className={styles.infoSection}>

          <div className={styles.sectionHeader}>

            <div className={styles.headingOrnament}>
              <span />
              <b>✦</b>
              <span />
            </div>

            <h2>At a Glance</h2>

          </div>

          <div className={styles.glanceGrid}>

            <article className={styles.glanceItem}>
              <span className={styles.glanceLabel}>
                Citizens
              </span>

              <strong>
                {kingdom.citizens || '—'}
              </strong>
            </article>

            <article className={styles.glanceItem}>
              <span className={styles.glanceLabel}>
                Foundation
              </span>

              <strong>—</strong>
            </article>

            <article className={styles.glanceItem}>
              <span className={styles.glanceLabel}>
                Form of State
              </span>

              <strong>
                Constitutional Monarchy
              </strong>
            </article>

            <article className={styles.glanceItem}>
              <span className={styles.glanceLabel}>
                Founding District
              </span>

              <strong>
                Ival
              </strong>
            </article>

            <article className={styles.glanceItem}>
              <span className={styles.glanceLabel}>
                Languages
              </span>

              <strong>
                Português · English
              </strong>
            </article>

            <article className={styles.glanceItem}>
              <span className={styles.glanceLabel}>
                Environment
              </span>

              <strong>
                Digital State
              </strong>
            </article>

          </div>

        </section>

        {/* =====================================================
            COMMUNITY
            ===================================================== */}

        <section className={styles.communitySection}>

          <div className={styles.sectionHeader}>

            <div className={styles.headingOrnament}>
              <span />
              <b>✦</b>
              <span />
            </div>

            <h2>Community</h2>

          </div>

          <div className={styles.communityGrid}>

            {communityCards.map(
              ({
                title,
                description,
                status,
                Icon,
                href,
              }) => {

                const content = (
                  <>
                    <div className={styles.communityIcon}>
                      <Icon />
                    </div>

                    <div className={styles.communityContent}>
                      <h3>{title}</h3>

                      <p>{description}</p>
                    </div>

                    <div className={styles.communityStatus}>
                      {status}
                    </div>
                  </>
                );

                return href ? (
                  <a
                    key={title}
                    className={styles.communityCard}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {content}
                  </a>
                ) : (
                  <div
                    key={title}
                    className={styles.communityCard}
                  >
                    {content}
                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* =====================================================
            THE KINGDOM TODAY
            ===================================================== */}

        <section className={styles.todaySection}>

          <div className={styles.sectionHeader}>

            <div className={styles.headingOrnament}>
              <span />
              <b>✦</b>
              <span />
            </div>

            <h2>The Kingdom Today</h2>

            <p className={styles.sectionIntro}>
              Live information, current activity and recent
              developments of the Kingdom.
            </p>

          </div>

          {/* LIVE NUMBERS */}

          <div className={styles.todayStatsGrid}>

            {todayStats.map(
              ({
                label,
                value,
                Icon,
              }) => (
                <article
                  key={label}
                  className={styles.todayStat}
                >
                  <div className={styles.todayStatIcon}>
                    <Icon />
                  </div>

                  <strong>
                    {value}
                  </strong>

                  <span>
                    {label}
                  </span>
                </article>
              )
            )}

          </div>

          {/* CURRENT ACTIVITY */}

          <div className={styles.currentActivity}>

            <div className={styles.currentActivityHeader}>

              <div>

                <span className={styles.activityEyebrow}>
                  CURRENT ACTIVITY
                </span>

                <h3>
                  {kingdom.currentActivity ??
                    'No current activity published'}
                </h3>

              </div>

              <ActivityIcon />
            </div>

            {kingdom.lastUpdate ? (
              <span className={styles.activityTimestamp}>
                Updated {kingdom.lastUpdate}
              </span>
            ) : (
              <span className={styles.activityTimestamp}>
                Waiting for live data
              </span>
            )}

          </div>

          {/* RECENT DEVELOPMENTS */}

          <div className={styles.recentActivity}>

            <div className={styles.recentActivityHeader}>

              <span className={styles.activityEyebrow}>
                RECENT DEVELOPMENTS
              </span>

              <span className={styles.recentActivityRule} />

            </div>

            {kingdom.recentActivity.length > 0 ? (
              <div className={styles.activityList}>

                {kingdom.recentActivity.map(
                  (item, index) => (
                    <Link
                      key={`${item.title}-${index}`}
                      className={styles.activityItem}
                      to={item.to}
                    >
                      <span className={styles.activityNumber}>
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className={styles.activityText}>
                        <strong>
                          {item.title}
                        </strong>

                        <small>
                          {item.meta}
                        </small>
                      </span>

                      <span className={styles.activityArrow}>
                        →
                      </span>
                    </Link>
                  )
                )}

              </div>
            ) : (
              <div className={styles.noActivity}>
                <span>—</span>

                <p>
                  No recent developments have been
                  published yet.
                </p>
              </div>
            )}

          </div>

        </section>

      </main>
    </Layout>
  );
}

/* =========================================================
   CURRENT ACTIVITY ICON
   ========================================================= */

function ActivityIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M13 13h38v38H13z" />
      <path d="M22 24h20M22 32h14M22 40h18" />
    </svg>
  );
}
