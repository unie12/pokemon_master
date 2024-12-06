import "./StatsRadarChart.css";
import React from "react";

const statsConfig = [
  { name: "체력", maxValue: 255, key: "hp", angle: 0 },
  { name: "공격", maxValue: 190, key: "attack", angle: Math.PI / 3 },
  { name: "방어", maxValue: 250, key: "defense", angle: (2 * Math.PI) / 3 },
  { name: "특수공격", maxValue: 194, key: "sp_attack", angle: Math.PI },
  {
    name: "특수방어",
    maxValue: 250,
    key: "sp_defense",
    angle: (4 * Math.PI) / 3,
  },
  { name: "스피드", maxValue: 200, key: "speed", angle: (5 * Math.PI) / 3 },
];

const StatsRadarChart = ({ pokemon }) => {
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];

  const generateGridPoints = (level) => {
    return statsConfig
      .map(
        (stat) =>
          `${level * Math.cos(stat.angle)},${level * Math.sin(stat.angle)}`
      )
      .join(" ");
  };

  const generateStatPoints = () => {
    return statsConfig
      .map((stat) => {
        const value = pokemon[stat.key];
        const normalizedValue = Math.min(1, value / stat.maxValue);
        return `${normalizedValue * Math.cos(stat.angle)},${
          normalizedValue * Math.sin(stat.angle)
        }`;
      })
      .join(" ");
  };

  return (
    <div className="stats-radar-container">
      <div className="radar-wrapper">
        <svg viewBox="-1.6 -1.6 3.2 3.2" width="400" height="400">
          {/* 배경 그리드 */}
          {gridLevels.map((level) => (
            <polygon
              key={`grid-${level}`}
              points={generateGridPoints(level)}
              className="radar-grid"
            />
          ))}

          {/* 축 라인 */}
          {statsConfig.map((stat) => (
            <line
              key={`axis-${stat.name}`}
              x1="0"
              y1="0"
              x2={Math.cos(stat.angle) * 1.1}
              y2={Math.sin(stat.angle) * 1.1}
              className="radar-axis"
            />
          ))}

          {/* 스탯 영역 */}
          <polygon points={generateStatPoints()} className="stat-polygon" />

          {/* 라벨과 값 */}
          {statsConfig.map((stat) => {
            const labelX = Math.cos(stat.angle) * 1.3;
            const labelY = Math.sin(stat.angle) * 1.3;
            const value = pokemon[stat.key];

            return (
              <g key={`label-${stat.name}`} className="stat-label-group">
                <text
                  x={labelX}
                  y={labelY}
                  className="stat-label"
                  textAnchor="middle"
                >
                  {stat.name}
                </text>
                <text
                  x={labelX}
                  y={labelY + 0.1}
                  className="stat-value"
                  textAnchor="middle"
                >
                  {value} / {stat.maxValue}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* 전체 수치 표시 영역 */}
      <div className="stat-info-panel">
        <h4>{pokemon.name} 스탯</h4>
        <ul>
          {statsConfig.map((stat) => (
            <li key={stat.key}>
              {stat.name}: {pokemon[stat.key]} / {stat.maxValue}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StatsRadarChart;
