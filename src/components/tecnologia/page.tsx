"use client";
import { IoLogoFirebase } from "react-icons/io5";
import {
  SiCss3,
  SiDocker,
  SiExpress,
  SiGit,
  SiJavascript,
  SiNestjs,
  SiNextdotjs,
  SiNodedotjs,
  SiPostgresql,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from "react-icons/si";
import { TbApi } from "react-icons/tb";
import Titan from "../titan/page";
import styles from "./InfinityScroll.module.css";

const technologies = [
  { icon: SiNextdotjs, name: "Next.js", color: "text-white dark:text-white" },
  { icon: SiNestjs, name: "NestJS", color: "text-red-500" },
  { icon: SiTypescript, name: "TypeScript", color: "text-blue-500" },
  { icon: SiJavascript, name: "JavaScript", color: "text-yellow-400" },
  { icon: SiReact, name: "React", color: "text-cyan-400" },
  { icon: SiNodedotjs, name: "Node.js", color: "text-green-500" },
  { icon: SiDocker, name: "Docker", color: "text-blue-400" },
  { icon: SiPostgresql, name: "PostgreSQL", color: "text-blue-600" },
  { icon: SiTailwindcss, name: "Tailwind", color: "text-cyan-400" },
  { icon: SiGit, name: "Git", color: "text-orange-500" },

  { icon: TbApi, name: "RESTful", color: "text-green-500" },
  { icon: SiCss3, name: "CSS3", color: "text-blue-600" },
  { icon: SiExpress, name: "Express", color: "text-gray-700" },
  { icon: IoLogoFirebase, name: "Firebase", color: "text-yellow-400" },
];

interface InfinityScrollAnimationProps {
  id?: string;
}
export default function InfinityScrollAnimation({
  id,
}: InfinityScrollAnimationProps) {
  return (
    <>
      <Titan title="Tecnologia:" />
      <div className="w-full max-w-6xl mx-auto" id={id}>
        <div className={styles.scrollContainer}>
          {/* efeito blur lateral */}
          <div className={styles.leftBlur}></div>
          <div className={styles.rightBlur}></div>

          <div className={styles.scrollWrapper}>
            <div className={styles.scrollContent}>
              {[
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
                ...technologies,
              ].map((tech, index) => (
                <div key={index} className={styles.techItem}>
                  <tech.icon className={`text-5xl ${tech.color}`} />
                  <span className="mt-2 text-white text-sm">{tech.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
