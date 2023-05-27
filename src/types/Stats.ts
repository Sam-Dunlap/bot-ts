import Pokemon from "./Pokemon";
import Rules from "./Rules";

export interface Stats {
    players: {
        [key: string]: {
            ps: string;
            kills: { [key: string]: { [key: string]: number } };
            deaths: { [key: string]: number };
            league_id?: string;
        };
    };
    playerNames: string[];
    info: {
        replay: string;
        history: string;
        turns: number;
        winner: string;
        loser: string;
        rules: Rules;
        result: string;
        battleId: string;
    };
    error?: string;
}

export interface RawStats {
    playerNames: string[];
    p1Pokemon: { [key: string]: Pokemon };
    p2Pokemon: { [key: string]: Pokemon };
    info: {
        replay: string;
        history: string;
        turns: number;
        winner: string;
        loser: string;
    };
    error?: string;
}
