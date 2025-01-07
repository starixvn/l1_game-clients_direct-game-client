import { DevTools, Tolgee } from "@tolgee/web";
import * as fs from "fs";
import * as path from "path";

function writeFile(fileName: string, content: string, extension = "json") {
    const dirname = path.dirname(fileName);

    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }

    fs.writeFileSync(`${fileName}.${extension}`, content, {
        encoding: "utf8",
        flag: "w",
    });
}

const namespace = ["gameNames", "Common"];
const languageFolder = `./src/i18n/`;
const languageCodes = ["en", "id", "th", "vi", "zh_cn", "zh_tw"];
const tg = Tolgee().use(DevTools()).init({
    defaultLanguage: "en",
    availableLanguages: languageCodes,
    apiKey: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    apiUrl: "https://tolgee.sabagame.com/",
    projectId: "5",
    defaultNs: "gameNames",
    ns: namespace,
});

tg.run();

tg.on("initialLoad", async () => {
    const languages: {
        [languageId: string]: {
            [ns: string]: {
                [key: string]: string;
            };
        };
    } = {};

    for (let index = 0; index < languageCodes.length; index++) {
        const languageId = languageCodes[index];

        await tg.changeLanguage(languageId);
        languages[languageId] = {};
        tg.getAllRecords().forEach((record) => {
            for (let i = 0; i < namespace.length; i++) {
                if (record.namespace == namespace[i]) {
                    languages[languageId][namespace[i]] = {};
                    record.data.forEach((value, key) => {
                        languages[languageId][namespace[i]][key] = value as string;
                    });
                }
            }
        });

        console.log("languages[languageId]", languages[languageId]);
        writeFile(languageFolder + languageId, JSON.stringify(languages[languageId], null, 4));
    }

    console.log("Generated done!");
});
