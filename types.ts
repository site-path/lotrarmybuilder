
export interface MagicalPower {
    name: string;
    range: number | string | null;
    casting: number;
}

export interface HeroFactionInfo {
    name: string;
    heroicTier: string;
}

export interface Hero {
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

export interface Faction {
    name: string;
    alignment: 'good' | 'evil';
    armyBonus?: string;
    parentFaction?: string;
}

export interface MesbgGameData {
    factions: Faction[];
    heroes: Hero[];
}
