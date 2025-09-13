
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import UnitCard from './components/UnitCard';
import Spinner from './components/Spinner';
import { MesbgGameData, Hero } from './types';

const ACTUAL_DATA_URL = 'https://nowforwrath.github.io/data2024.json';

const App: React.FC = () => {
  const [gameData, setGameData] = useState<MesbgGameData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFaction, setSelectedFaction] = useState<string>('all');
  const [selectedAlignment, setSelectedAlignment] = useState<string>('all');

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
    
    const factionAlignmentMap = new Map<string, 'good' | 'evil'>();
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
        } as Hero;
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

export default App;
