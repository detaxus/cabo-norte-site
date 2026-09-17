import React from 'react';

export default function SectionHeader({
  number,
  eyebrow,
  title,
  description,
}) {
  return (
    <header className="cn-section-header">
      <div className="cn-section-meta">
        {number && <span>{number}</span>}
        <span>{eyebrow}</span>
      </div>

      <h1>{title}</h1>

      {description && <p>{description}</p>}
    </header>
  );
}
