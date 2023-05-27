import axios from "axios";
import {
    CommandInteraction,
    CommandInteractionOptionResolver,
    TextBasedChannel,
    GuildMember,
    EmbedBuilder,
} from "discord.js";
import { System } from "@prisma/client";

import { Prisma } from "../utils/index.js";

const updateDb = async (
    interaction: CommandInteraction,
    channel: TextBasedChannel,
    mode: System,
    updateObj: {
        channelId: string;
        system: string;
        leagueName?: string;
        guildId?: string;
        resultsChannelId?: string;
        dlId?: string;
        sheetId?: string;
        rolesChannels?: {};
    }
) => {
    let league = await Prisma.getLeague(channel.id);
    const modes = {
        D: "Default",
        C: "Channel",
        DM: "DM",
        S: "Sheets",
        DL: "DL",
        R: "Roles",
        "": "Default",
    };

    if (league) {
        await Prisma.upsertLeague(updateObj);

        console.log(
            `${league.name}'s mode has been changed to ${
                modes[mode] || "Default"
            } mode!`
        );
        return await interaction.reply({
            content: `\`${league.name}\`'s mode has been changed to ${
                modes[mode] || "Default"
            } mode! ${
                modes[mode] === "Sheets"
                    ? "Please give full editing permissions to `sam-dunlap@porygonupdate.iam.gserviceaccount.com`; I won't be able to work without it."
                    : ""
            }`,
            ephemeral: true,
        });
    } else {
        // Gives league a default name
        let leagueName = channel.id;
        updateObj.leagueName = leagueName;
        await Prisma.upsertLeague(updateObj);

        console.log(
            `${leagueName}'s mode has been set to ${
                modes[mode] || "Default"
            } mode!`
        );
        return await interaction.reply({
            content: `\`${leagueName}\`'s mode has been set to ${
                modes[mode] || "Default"
            } mode! ${
                modes[mode] === "Sheets"
                    ? "Please give full editing permissions to `sam-dunlap@porygonupdate.iam.gserviceaccount.com`; I won't be able to work without it."
                    : ""
            }`,
            ephemeral: true,
        });
    }
};

export default {
    name: "mode",
    description: "Sets the stats updating mode. Run describe to get more info.",
    usage: "[mode name with hyphen] [parameter]",
    options: [
        {
            name: "describe",
            description: "in-depth explanation of modes",
            type: 1,
        },
        {
            name: "channel",
            description: "output to specified channel",
            type: 1,
            options: [
                {
                    name: "id",
                    description: "desired channel ID",
                    required: true,
                    type: 7,
                },
            ],
        },
        {
            name: "message",
            description: "output to a user's DMs (this doesn't work)",
            type: 1,
            options: [
                {
                    name: "user",
                    description: "user to send outputs to",
                    required: true,
                    type: 6,
                },
            ],
        },
        {
            name: "sheets",
            description: "output to a google sheet",
            type: 1,
            options: [
                {
                    name: "url",
                    description: "google sheets URL",
                    required: true,
                    type: 3,
                },
            ],
        },
    ],
    async execute(
        interaction: CommandInteraction,
        options: CommandInteractionOptionResolver
    ) {
        const channel = interaction.channel as TextBasedChannel;
        const author = interaction.member as GuildMember;
        const mode = options.getSubcommand();
        let system: System = "D";

        if (author && !author.permissions.has("ManageRoles")) {
            return interaction.reply({
                content:
                    ":x: You're not a moderator. Ask a moderator to set the mode of this league for you.",
                ephemeral: true,
            });
        }

        let streamChannel;
        let sheetsID = "";
        let dlID = "";
        let rolesChannels = {} as { [key: string]: string };
        switch (mode) {
            case "channel":
                system = "C";
                // channel needs to be checked to make sure it's text
                let channel = options.getChannel("id");
                streamChannel = channel;
                break;
            case "message":
                return interaction.reply(
                    "sorry, this feature doesn't exist yet."
                );
            case "sheets":
                system = "S";
                let sheetsLink = options.getString("url");
                if (
                    !(
                        sheetsLink &&
                        sheetsLink.includes(
                            "https://docs.google.com/spreadsheets/d"
                        )
                    )
                ) {
                    return interaction.reply({
                        content:
                            ":x: This is not a Google Sheets link. Please copy-paste the URL of your Google Sheets file.",
                        ephemeral: true,
                    });
                }
                sheetsID = sheetsLink.split("/")[5];

                break;
            case "describe":
                const modesDetail = new EmbedBuilder()
                    .setColor(0xe15d75)
                    .setTitle("Mode Details")
                    .addFields(
                        {
                            name: "Channel",
                            value: "Sends replay data to the text channel specified by [parameter].",
                        },
                        {
                            name: "DM",
                            value: "DMs replay data. Gotta be honest fellas, harbar didn't implement DM yet and if you run `/mode DM` nothing will happen. One of us might get around to fixing that, but we sure haven't yet.",
                        },
                        {
                            name: "Sheets",
                            value: "Sends replay data to the Google Sheets spreadsheet specified by [parameter].",
                        }
                    );
                return interaction.reply({
                    embeds: [modesDetail],
                    ephemeral: true,
                });
            default:
                break;
        }

        await updateDb(interaction, channel, system, {
            channelId: channel.id,
            system: system,
            guildId: interaction.guild?.id,
            resultsChannelId: streamChannel?.id,
            dlId: dlID,
            sheetId: sheetsID,
            rolesChannels: rolesChannels,
        });
    },
};
