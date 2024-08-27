import { Guild, GuildChannel } from "discord.js";
import { RawStats } from "../types";

const getChannel = (server: Guild, channelID: string) => {
    return server.channels.cache.get(channelID) as GuildChannel;
};

const randomElement = (list: string[]) => {
    return list[Math.round(Math.random() * (list.length - 1))];
};

const fixName = (name: string): string => {
    if (name.endsWith("Hisui")) name += "an";
    if (name.endsWith("Paldea") || name.endsWith("Alola")) name += "n";
    if (name.endsWith("Galar")) name += "ian";
    if (name.includes("Dudunsparce")) name = "Dudunsparce";
    if (name.includes("Palafin")) name = "Palafin";
    if (name.includes("Tatsugiri")) name = "Tatsugiri";
    if (
        name == "Landorus" ||
        name == "Thundurus" ||
        name == "Enamorus" ||
        name == "Tornadus"
    )
        name += "-Incarnate";
    if (name === "Urshifu") name = "Urshifu-Single-Strike";
    if (name === "Urshifu-*") name = "Urshifu";
    if (name === "Greninja-*") name = "Greninja";
    if (name === "Zacian-*") name = "Zacian";
    if (name === "Zamazenta-*") name = "Zamazenta";
    if (name.endsWith("Busted")) name = "Mimikyu";
    if (name.includes("Terapagos")) name = "Terapagos-Terastal";
    if (name.startsWith("Ogerpon") && name.endsWith("-Tera"))
        name = name.slice(0, -5);
    return name;
};

const formatToCSV = (results: RawStats, timeStamp: Date): string => {
    const day = timeStamp.getDate();
    const month = timeStamp.getMonth() + 1;
    const year = timeStamp.getFullYear();
    const fullDate = `${year}-${month >= 10 ? month : `0${month}`}-${
        day >= 10 ? day : `0${day}`
    }`;
    let returnString = "";

    const p1pokes = results.p1Pokemon;
    for (const key in p1pokes) {
        const pokemon = p1pokes[key];
        returnString += `${fullDate},${results.info.replay},${
            results.playerNames[0]
        },${pokemon.name},${pokemon.status === "n/a" ? "" : pokemon.status},${
            pokemon.statusInflictor
        },${pokemon.directKills},${pokemon.passiveKills},${
            pokemon.isDead ? 1 : 0
        },${pokemon.killer},${pokemon.terastallize},${
            pokemon.brought ? 1 : 0
        },${results.info.winner === results.playerNames[0] ? 1 : 0},${
            pokemon.lead ? 1 : 0
        },${pokemon.turnsOnBattlefield},${pokemon.percentDealt},${
            pokemon.currentHealth
        }\n`;
    }
    const p2pokes = results.p2Pokemon;
    for (const key in p2pokes) {
        const pokemon = p2pokes[key];
        returnString += `${fullDate},${results.info.replay},${
            results.playerNames[1]
        },${pokemon.name},${pokemon.status === "n/a" ? "" : pokemon.status},${
            pokemon.statusInflictor
        },${pokemon.directKills},${pokemon.passiveKills},${
            pokemon.isDead ? 1 : 0
        },${pokemon.killer},${pokemon.terastallize},${
            pokemon.brought ? 1 : 0
        },${results.info.winner === results.playerNames[1] ? 1 : 0},${
            pokemon.lead ? 1 : 0
        },${pokemon.turnsOnBattlefield},${pokemon.percentDealt},${
            pokemon.currentHealth
        }\n`;
    }
    return returnString;
};

const funcs = {
    getChannel,
    randomElement,
    formatToCSV,
    fixName,
};

export default funcs;
