import { Guild, GuildChannel } from "discord.js";
import { RawStats } from "../types";

const getChannel = (server: Guild, channelID: string) => {
    return server.channels.cache.get(channelID) as GuildChannel;
};

const randomElement = (list: string[]) => {
    return list[Math.round(Math.random() * (list.length - 1))];
};

const formatToCSV = (results: RawStats): string => {
    let returnString = "";

    const p1pokes = results.p1Pokemon;
    for (const key in p1pokes) {
        const pokemon = p1pokes[key];
        returnString += `${results.info.replay},${results.playerNames[0]},${
            pokemon.name
        },${pokemon.status},${pokemon.statusInflictor},${pokemon.directKills},${
            pokemon.passiveKills
        },${pokemon.isDead},${pokemon.killer},${pokemon.terastallize},${
            pokemon.brought
        },${results.info.winner === results.playerNames[0] ? 1 : 0},${
            pokemon.lead
        },${pokemon.turnsOnBattlefield}\n`;
    }
    const p2pokes = results.p2Pokemon;
    for (const key in p2pokes) {
        const pokemon = p2pokes[key];
        returnString += `${results.info.replay},${results.playerNames[1]},${
            pokemon.name
        },${pokemon.status},${pokemon.statusInflictor},${pokemon.directKills},${
            pokemon.passiveKills
        },${pokemon.isDead},${pokemon.killer},${pokemon.terastallize},${
            pokemon.brought
        },${results.info.winner === results.playerNames[1] ? 1 : 0},${
            pokemon.lead
        },${pokemon.turnsOnBattlefield}\n`;
    }
    return returnString;
};

const funcs = {
    getChannel,
    randomElement,
    formatToCSV,
};

export default funcs;
