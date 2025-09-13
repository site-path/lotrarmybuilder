
import React from 'react';
import { Hero } from '../types';

const StatPill: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
    <div className={`flex flex-col items-center justify-center bg-slate-800/50 p-2 rounded-md text-center ${className}`}>
        <span className="text-xs text-brand-text-dim">{label}</span>
        <span className="font-bold text-lg text-white">{value}</span>
    </div>
);

const Section: React.FC<{ title: string; items?: string[]; children?: React.ReactNode }> = ({ title, items, children }) => {
    if ((!items || items.length === 0) && !children) return null;
    return (
        <div className="mt-4">
            <h4 className="font-bold text-sm text-brand-primary uppercase tracking-wider border-b border-brand-secondary/30 pb-1 mb-2">{title}</h4>
            {items && (
                 <ul className="text-xs text-brand-text-dim space-y-1 list-disc list-inside">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            )}
            {children}
        </div>
    );
};

const UnitCard: React.FC<{ unit: Hero }> = ({ unit }) => {
  if (unit.hideStats) return null;

  const alignmentColor = unit.alignment === 'good' ? 'border-alignment-good' 
                       : unit.alignment === 'evil' ? 'border-alignment-evil'
                       : 'border-slate-600';

  const statGrid = [
      { label: 'Mv', value: unit.movement ? `${unit.movement}"` : '-' },
      { label: 'F/S', value: `${unit.fight || '-'}/${unit.shoot || '-'}+` },
      { label: 'S', value: unit.strength || '-' },
      { label: 'D', value: unit.defence || '-' },
      { label: 'A', value: unit.attack || '-' },
      { label: 'W', value: unit.wounds || '-' },
      { label: 'C', value: unit.courage || '-' },
  ];
  
  const mwfStats = [
      { label: 'Might', value: unit.might ?? '-' },
      { label: 'Will', value: unit.will ?? '-' },
      { label: 'Fate', value: unit.fate ?? '-' },
  ];

  return (
    <div className={`bg-brand-surface rounded-lg shadow-lg overflow-hidden border-t-4 ${alignmentColor} transition-transform duration-300 hover:scale-105 hover:shadow-2xl flex flex-col`}>
        <div className="p-4 flex-grow">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <p className="text-sm text-brand-text-dim uppercase tracking-wider">{unit.factions[0]?.name}</p>
                    <h2 className="text-xl font-bold text-white">{unit.name}</h2>
                </div>
                <div className="flex items-center space-x-2 bg-brand-secondary text-white font-bold py-1 px-3 rounded-full text-lg">
                    <span>{unit.points}</span>
                    <span className="text-xs opacity-80">pts</span>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
                {statGrid.map(stat => <StatPill key={stat.label} label={stat.label} value={stat.value} />)}
            </div>
            <div className="grid grid-cols-3 gap-1">
                {mwfStats.map(stat => <StatPill key={stat.label} label={stat.label} value={stat.value} className="bg-slate-700/60"/>)}
            </div>

            {unit.keywords && unit.keywords.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-bold text-sm text-brand-primary uppercase tracking-wider">Keywords</h4>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {unit.keywords.map(kw => (
                        <span key={kw} className="px-2 py-1 bg-slate-700 text-xs text-slate-300 rounded-md">{kw}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>

        <div className="bg-slate-900/50 p-4 mt-auto text-brand-text-dim">
            <Section title="Wargear" items={unit.wargear} />
            <Section title="Heroic Actions" items={unit.heroicActions} />
            <Section title="Special Rules" items={unit.specialRules} />
            <Section title="Magical Powers">
                {unit.magicalPowers && unit.magicalPowers.length > 0 && (
                     <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs mt-2">
                            <thead className="bg-slate-700/50 text-slate-300">
                                <tr>
                                    <th className="p-2">Name</th>
                                    <th className="p-2 text-center">Range</th>
                                    <th className="p-2 text-center">Casting</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {unit.magicalPowers.map((power, index) => (
                                    <tr key={index}>
                                        <td className="p-2 font-medium text-white">{power.name}</td>
                                        <td className="p-2 text-center">{power.range ? `${power.range}"` : '-'}</td>
                                        <td className="p-2 text-center">{power.casting}+</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Section>
        </div>
    </div>
  );
};

export default UnitCard;
