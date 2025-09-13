// Fix: Add imports for React and ReactDOM to handle module scope and enable modern features.
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// --- TYPE DEFINITIONS ---
// Note: Interfaces are used for development clarity and will be stripped by Babel.

interface MagicalPower {
    name: string;
    range: number | string | null;
    casting: number;
}

interface HeroFactionInfo {
    name: string;
    heroicTier: string;
}

interface Hero {
    name: string;
    points: number;
    movement?: number;
    fight?: number | string;
    shoot?: number | string;
    strength?: number;
    defence?: number;
    attack?: number;
    wounds?: number;
    courage?: number;
    might?: number;
    will?: number;
    fate?: number;
    keywords?: string[];
    factions: HeroFactionInfo[];
    heroicActions?: string[];
    specialRules?: string[];
    magicalPowers?: MagicalPower[];
    wargear?: string[];
    options?: any[];
    unavailableSolo?: boolean;
    autoAddOnly?: boolean;
    hideStats?: boolean;
    alignment: 'good' | 'evil' | 'neutral';
}

interface Faction {
    name: string;
    alignment: 'good' | 'evil';
    parentFaction?: string;
}

interface MesbgGameData {
    factions: Faction[];
    heroes: Hero[];
}


// --- SPINNER COMPONENT ---
const Spinner = () => (
  <div className="flex justify-center items-center p-8">
    <svg 
        className="animate-spin h-12 w-12 text-brand-primary" 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
    >
      <circle 
          className="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          strokeWidth="4"
      ></circle>
      <path 
          className="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);


// --- UNIT CARD COMPONENT ---
const StatPill = ({ label, value, className = '' }: { label: string, value: string | number, className?: string }) => (
    <div className={`flex flex-col items-center justify-center bg-slate-800/50 p-2 rounded-md text-center ${className}`}>
        <span className="text-xs text-brand-text-dim">{label}</span>
        <span className="font-bold text-lg text-white">{value}</span>
    </div>
);

// Fix: Add explicit types for component props to prevent inference errors.
const Section = ({ title, items, children }: { title: string; items?: string[]; children?: React.ReactNode }) => {
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

const UnitCard = ({ unit }: { unit: Hero }) => {
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
                        {(unit.keywords || []).map(kw => (
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


// --- MAIN APP COMPONENT ---
const App = () => {
  // Fix: Use imported hooks and provide explicit types for state to fix downstream type errors.
  const [gameData, setGameData] = useState<MesbgGameData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<string>('all');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('all');

  const ACTUAL_DATA_URL = 'https://nowforwrath.github.io/data2024.json';

  const fetchGameData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(ACTUAL_DATA_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.data || !data.data.factions || !data.data.heroes) {
        throw new Error("Invalid data structure received from API.");
      }
      setGameData(data.data);
      setError(null);
    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to fetch data: ${e.message}`);
      } else {
        setError('An unknown error occurred.');
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  const factions = useMemo(() => {
    if (!gameData?.factions) return [];
    const factionNames = new Set(gameData.factions.map(f => f.name));
    return Array.from(factionNames).sort((a, b) => a.localeCompare(b));
  }, [gameData]);

  const processedHeroes = useMemo(() => {
    if (!gameData) return [];
    
    const factionAlignmentMap = new Map<'good' | 'evil'>();
    gameData.factions.forEach(f => {
        factionAlignmentMap.set(f.name, f.alignment);
    });

    gameData.factions.forEach(f => {
        if(f.parentFaction && !factionAlignmentMap.has(f.name)) {
            const parentAlignment = factionAlignmentMap.get(f.parentFaction);
            if(parentAlignment) {
                factionAlignmentMap.set(f.name, parentAlignment);
            }
        }
    });

    return gameData.heroes
      .filter(hero => !hero.unavailableSolo && !hero.autoAddOnly && hero.name !== 'No Hero' && !hero.hideStats)
      .map(hero => {
        const primaryFactionName = hero.factions[0]?.name;
        const alignment = factionAlignmentMap.get(primaryFactionName) || 'neutral';
        return {
            ...hero,
            alignment,
        };
    });
  }, [gameData]);

  const filteredHeroes = useMemo(() => {
    return processedHeroes.filter(hero => {
      const matchesAlignment = selectedAlignment === 'all' || hero.alignment === selectedAlignment;
      const matchesFaction = selectedFaction === 'all' || hero.factions.some(f => f.name === selectedFaction);
      
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = searchTerm.trim() === '' || 
        hero.name.toLowerCase().includes(searchLower) ||
        (hero.keywords || []).some(kw => kw.toLowerCase().includes(searchLower)) ||
        (hero.specialRules || []).some(rule => rule.toLowerCase().includes(searchLower));
      
      return matchesAlignment && matchesFaction && matchesSearch;
    });
  }, [processedHeroes, searchTerm, selectedFaction, selectedAlignment]);

  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <header className="bg-brand-surface sticky top-0 z-10 shadow-md py-4">
        <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold text-white">Middle-Earth SBG</h1>
                    <p className="text-brand-primary">Unit Profile Browser</p>
                </div>
                <div className="w-full md:w-auto flex flex-col sm:flex-row flex-wrap justify-center gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-48 bg-slate-800 text-white placeholder-slate-400 border border-slate-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                    <select
                        value={selectedAlignment}
                        onChange={(e) => setSelectedAlignment(e.target.value)}
                        className="w-full sm:w-auto bg-slate-800 text-white border border-slate-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="all">All Alignments</option>
                        <option value="good">Good</option>
                        <option value="evil">Evil</option>
                    </select>
                    <select
                        value={selectedFaction}
                        onChange={(e) => setSelectedFaction(e.target.value)}
                        className="w-full sm:w-48 bg-slate-800 text-white border border-slate-700 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    >
                        <option value="all">All Factions</option>
                        {factions.map(factionName => (
                            <option key={factionName} value={factionName}>
                                {factionName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        {loading && <Spinner />}
        {error && <div className="text-center text-red-400 bg-red-900/50 p-4 rounded-md">{error}</div>}
        
        {!loading && !error && gameData && (
          <>
            <div className="mb-4 text-brand-text-dim">
              Showing {filteredHeroes.length} of {processedHeroes.length} profiles.
            </div>
            {filteredHeroes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                    {filteredHeroes.map(hero => (
                        <UnitCard key={hero.name} unit={hero} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-brand-text-dim bg-brand-surface p-8 rounded-md">
                    <h3 className="text-2xl text-white font-semibold">No Profiles Found</h3>
                    <p className="mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}
          </>
        )}
      </main>
      
      <footer className="text-center py-6 text-sm text-brand-text-dim">
        <p>Data from Now for Wrath Blog. This is an unofficial fan-made tool.</p>
      </footer>
    </div>
  );
};


// --- RENDER THE APP ---
// Fix: Use createRoot from the imported ReactDOM and add a non-null assertion for the root element.
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
