"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface LanguageChartProps {
  languages: Record<string, number>;
  totalRepos: number;
}

const languageColors: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Shell: "#89e051",
  PHP: "#4F5D95",
  Ruby: "#701516",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
};

export function LanguageChart({ languages, totalRepos }: LanguageChartProps) {
  const data = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({
      name,
      count,
      percentage: ((count / totalRepos) * 100).toFixed(1),
      fill: languageColors[name] || "#6e7681",
    }));

  return (
    <Card className="overflow-hidden bg-slate-900/50 border-slate-700/50 backdrop-blur-sm neon-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-linear-to-r from-cyan-400 to-purple-500 animate-pulse neon-glow" />
          <span className="neon-text">Linguagens Utilizadas</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 0, right: 40 }}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={80}
                tick={{ fill: "currentColor", fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value} repos (${
                    data.find((d) => d.name === name)?.percentage
                  }%)`,
                  name,
                ]}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Neon Badges */}
        <div className="flex flex-wrap gap-2 mt-4">
          {data.map((lang) => (
            <span
              key={lang.name}
              className="px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105 cursor-default"
              style={{
                backgroundColor: `${lang.fill}20`,
                color: lang.fill,
                boxShadow: `0 0 10px ${lang.fill}40, inset 0 0 10px ${lang.fill}10`,
                border: `1px solid ${lang.fill}50`,
              }}
            >
              {lang.name} • {lang.percentage}%
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
