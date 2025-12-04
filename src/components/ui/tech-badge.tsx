"use client";

import styles from "./tech-badge.module.css";

const techConfig: Record<string, { color: string; glow: string }> = {
  TypeScript: { color: "#3178c6", glow: "rgba(49, 120, 198, 0.5)" },
  JavaScript: { color: "#f1e05a", glow: "rgba(241, 224, 90, 0.5)" },
  Python: { color: "#3572A5", glow: "rgba(53, 114, 165, 0.5)" },
  Java: { color: "#b07219", glow: "rgba(176, 114, 25, 0.5)" },
  Go: { color: "#00ADD8", glow: "rgba(0, 173, 216, 0.5)" },
  Rust: { color: "#dea584", glow: "rgba(222, 165, 132, 0.5)" },
  HTML: { color: "#e34c26", glow: "rgba(227, 76, 38, 0.5)" },
  CSS: { color: "#563d7c", glow: "rgba(86, 61, 124, 0.5)" },
  Vue: { color: "#41b883", glow: "rgba(65, 184, 131, 0.5)" },
  Shell: { color: "#89e051", glow: "rgba(137, 224, 81, 0.5)" },
  PHP: { color: "#4F5D95", glow: "rgba(79, 93, 149, 0.5)" },
  Ruby: { color: "#701516", glow: "rgba(112, 21, 22, 0.5)" },
  "C++": { color: "#f34b7d", glow: "rgba(243, 75, 125, 0.5)" },
  C: { color: "#555555", glow: "rgba(85, 85, 85, 0.5)" },
  "C#": { color: "#178600", glow: "rgba(23, 134, 0, 0.5)" },
  Swift: { color: "#ffac45", glow: "rgba(255, 172, 69, 0.5)" },
  Kotlin: { color: "#A97BFF", glow: "rgba(169, 123, 255, 0.5)" },
  Dart: { color: "#00B4AB", glow: "rgba(0, 180, 171, 0.5)" },
  SCSS: { color: "#c6538c", glow: "rgba(198, 83, 140, 0.5)" },
  Dockerfile: { color: "#384d54", glow: "rgba(56, 77, 84, 0.5)" },
};

export function TechBadge({ tech }: { tech: string }) {
  const config = techConfig[tech] || {
    color: "#6e7681",
    glow: "rgba(110, 118, 129, 0.5)",
  };

  // Apply CSS variables via data attributes
  return (
    <span
      className={styles.techBadge}
      data-tech-bg={`${config.color}20`}
      data-tech-color={config.color}
      data-tech-border={`${config.color}60`}
      data-tech-glow={config.glow}
      style={
        {
          "--tech-bg": `${config.color}20`,
          "--tech-color": config.color,
          "--tech-border": `${config.color}60`,
          "--tech-glow": config.glow,
        } as React.CSSProperties
      }
    >
      {tech}
    </span>
  );
}
