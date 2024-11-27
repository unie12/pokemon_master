import './StatsRadarChart.css';
import React, { useState, useEffect } from 'react';

const statsConfig = [
    { name: 'HP', maxValue: 255, key: 'hp', angle: 0 },
    { name: 'Attack', maxValue: 190, key: 'attack', angle: Math.PI / 3 },
    { name: 'Defense', maxValue: 250, key: 'defense', angle: 2 * Math.PI / 3 },
    { name: 'Sp. Attack', maxValue: 194, key: 'sp_attack', angle: Math.PI },
    { name: 'Sp. Defense', maxValue: 250, key: 'sp_defense', angle: 4 * Math.PI / 3 },
    { name: 'Speed', maxValue: 200, key: 'speed', angle: 5 * Math.PI / 3 }
];

const StatsRadarChart = ({ pokemon }) => {
    const gridLevels = [0.2, 0.4, 0.6, 0.8, 1];  

    const generateGridPoints = (level) => {
        return statsConfig.map(stat =>
            `${level * Math.cos(stat.angle)},${level * Math.sin(stat.angle)}`
        ).join(' ');
    };

    const generateStatPoints = () => {
        return statsConfig.map(stat => {
            const value = pokemon[stat.key];
            const normalizedValue = Math.min(1, value / stat.maxValue);
            return `${normalizedValue * Math.cos(stat.angle)},${normalizedValue * Math.sin(stat.angle)}`;
        }).join(' ');
    };

    return (
        <div className="stats-radar-container">
            <div className="radar-wrapper">
                <svg 
                    viewBox="-1.5 -1.5 3 3"  
                    width="400"
                    height="400"
                    overflow="visible"  
                >
                    {/* 배경 그리드 */}
                    {gridLevels.map((level) => (
                        <g key={`grid-${level}`}>
                            <polygon
                                points={generateGridPoints(level)}
                                className="radar-grid"
                            />
                            {/* 각 레벨별 수치 표시 */}
                            <text
                                x="0"
                                y={-level - 0.05}
                                className="grid-label"
                                textAnchor="middle"
                            >
                                {Math.round(level * 100)}%
                            </text>
                        </g>
                    ))}

                    {/* 축 라인 */}
                    {statsConfig.map(stat => (
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
                    <g className="stat-group">
                        <polygon
                            points={generateStatPoints()}
                            className="stat-polygon"
                        />
                        {/* 스탯 포인트와 값 */}
                        {statsConfig.map(stat => {
                            const value = pokemon[stat.key];
                            const normalizedValue = Math.min(1, value / stat.maxValue);
                            const angle = stat.angle;
                            const x = normalizedValue * Math.cos(angle); 
                            const y = normalizedValue * Math.sin(angle);

                            return (
                                <g key={`stat-${stat.name}`} className="stat-point-group">
                                    <circle
                                        cx={x}
                                        cy={y}
                                        r="0.05"
                                        className="stat-point"
                                    />
                                    <text
                                        x={x}
                                        y={y - 0.15} 
                                        className="stat-value-tooltip"
                                        textAnchor="middle"
                                        dy=".35em" 
                                    >
                                        {value}
                                    </text>
                                </g>
                            );
                        })}
                    </g>

                    {/* 라벨과 최댓값 */}
                    {statsConfig.map(stat => {
                        const labelX = Math.cos(stat.angle) * 1.5;
                        const labelY = Math.sin(stat.angle) * 1.5;

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
                                    y={labelY + 0.15}
                                    className="stat-max"
                                    textAnchor="middle"
                                >
                                    ({stat.maxValue})
                                </text>
                            </g>
                        );
                    })}
                </svg>
            </div>
        </div>
    );
};

export default StatsRadarChart;
