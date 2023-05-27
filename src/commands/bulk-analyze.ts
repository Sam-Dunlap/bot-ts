import {
    CommandInteractionOptionResolver,
    CommandInteraction,
} from "discord.js";

import axios from "axios";
import { Prisma, ReplayTracker, funcs } from "../utils/index.js";
import { readFileSync, writeFileSync } from "fs";

export default {
    name: "bulk",
    description: "analyzes multiple replays at once.",
    options: [
        {
            name: "links",
            description: ".csv file with showdown links",
            required: true,
            type: 11,
        },
    ],
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        await interaction.deferReply();
        const linkFileURL = options.getAttachment("links")?.url;
        const rules = await Prisma.getRules(interaction.channel?.id as string);
        if (!linkFileURL) return;
        const response = await axios.get(linkFileURL).catch(async (e) => {
            await interaction.editReply(`:x: sorry there was an error :x:`);
            console.log(e);
            return;
        });
        writeFileSync(
            `output${interaction.id as string}.csv`,
            "Battle,Coach,Pokemon,Status,Status Inflictor,Direct Kills,Passive Kills,Died,Killer,Tera,Brought,Won,Lead,Turns on Field\n"
        );
        if (!response) return;
        const linkCSV = response.data;
        const linkArray = linkCSV.split(",");
        linkArray.forEach(async (link: string) => {
            let log = link + ".log";
            let response = await axios
                .get(log, {
                    headers: { "User-Agent": "PorygonTheBot" },
                })
                .catch(async (e) => {
                    console.log(e);
                    await interaction.editReply(
                        `:ambulance: i'm in trouble... (something went wrong)`
                    );
                    return;
                });
            if (!response) {
                await interaction.editReply(
                    `:ambulance: i'm in trouble... (something went wrong)`
                );
                return;
            }
            let data = response.data;

            let replayer = new ReplayTracker(log, rules);
            const matchJson = await replayer.track(data);
            const csvResponse = funcs.formatToCSV(matchJson);
            writeFileSync(`output${interaction.id}.csv`, csvResponse, {
                flag: "a+",
            });
        });
        await interaction.editReply({ files: [`output${interaction.id}.csv`] });
    },
};
