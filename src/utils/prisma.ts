import { PrismaClient } from "@prisma/client";
import { Rules } from "../types";

//Database!
const prisma = new PrismaClient();

class Prisma {
    static async upsertLeague(obj: {
        channelId: string;
        system: string;
        leagueName?: string;
        guildId?: string;
        resultsChannelId?: string;
        dlId?: string;
        sheetId?: string;
        rolesChannels?: {};
    }) {
        const league = await this.getLeague(obj.channelId);
        await prisma.league.upsert({
            where: {
                channelId: obj.channelId,
            },
            update: {
                system: obj.system as "D" | "DM" | "C" | "S" | "DL" ?? "D",
                name: obj.leagueName ?? league?.name,
                resultsChannelId: obj.resultsChannelId ?? "",
                dlId: obj.dlId ?? "",
                sheetId: obj.sheetId ?? "",
                rolesChannels: obj.rolesChannels,
            },
            create: {
                name: obj.leagueName ?? "",
                guildId: obj.guildId ?? "",
                channelId: obj.channelId,
                system: obj.system as "D" | "DM" | "C" | "S" | "DL" ?? "D",
                resultsChannelId: obj.resultsChannelId ?? "",
                dlId: obj.dlId ?? "",
                sheetId: obj.sheetId ?? "",
                rolesChannels: obj.rolesChannels,
            },
        });
    }

    static async leagueWhere(prop: string, value: string) {
        let obj = {} as { [key: string]: string };
        obj[prop] = value;
        const leagues = await prisma.league.findMany({
            where: obj,
        });

        return leagues;
    }

    static async getLeague(channelId: string) {
        const league = await prisma.league.findUnique({
            where: {
                channelId: channelId,
            },
        });

        return league;
    }

    static async deleteLeague(channelId: string) {
        let league = await this.getLeague(channelId);
        if (league) {
            await prisma.league.delete({
                where: {
                    channelId: channelId,
                },
            });

            await prisma.rules.delete({
                where: {
                    channelId: channelId,
                },
            }).catch((e) => console.log(`${league?.name} doesn't have any rules to delete.`));
        }
    }

    static async upsertRules(
        channelId: string,
        name?: string,
        rules?: { [key: string]: string | boolean }
    ) {
        await prisma.rules.upsert({
            where: {
                channelId: channelId,
            },
            update: {
                ...rules,
            },
            create: {
                channelId: channelId,
                leagueName: name ?? "",
                ...rules,
            },
        });
    }

    static async getRules(channelId: string) {
        let rules = {
            channelId: channelId,
            leagueName: "Default",
            recoil: "D",
            suicide: "D",
            abilityitem: "P",
            selfteam: "N",
            db: "P",
            spoiler: true,
            ping: "",
            forfeit: "N",
            format: "D",
            quirks: true,
            notalk: false,
            tb: true,
            combine: false,
            redirect: "",
        } as Rules;

        const numLeagues = await prisma.rules.count({
            where: {
                channelId: channelId,
            },
        });

        if (numLeagues >= 1) {
            let prismaRules = await prisma.rules
                .findUnique({
                    where: {
                        channelId: channelId,
                    },
                })
                .catch((e: Error) => {
                    console.error(e);
                });

            if (prismaRules) rules = prismaRules as unknown as Rules;
        }

        return rules;
    }

    static async getAll() {
        const leagues = await prisma.league.findMany();
        const rules = await prisma.rules.findMany();

        return {
            rules: rules,
            leagues: leagues,
        };
    }
}

export default Prisma;
