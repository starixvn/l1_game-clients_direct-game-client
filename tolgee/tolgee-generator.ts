import { DevTools, Tolgee } from "@tolgee/web";
import * as fs from "fs";
import * as path from "path";
import { languageCodes, locales, ResourceTypes } from "../src/_shared/consts";

function writeFile(fileName: string, content: string, extension = "json") {
    const dirname = path.dirname(fileName);

    if (!fs.existsSync(dirname)) {
        fs.mkdirSync(dirname, { recursive: true });
    }
    fs.appendFileSync(`${fileName}.${extension}`, content, {
        encoding: "utf8",
        flag: "w",
    });
}

const namespaces = [ResourceTypes.GAME_NAMES, ResourceTypes.COMMON, ResourceTypes.MESSAGES, ResourceTypes.INSTANT_GAME];
const tg = Tolgee().use(DevTools()).init({
    defaultLanguage: locales.en,
    availableLanguages: languageCodes,
    apiKey: "tgpak_gvpw45brha2xg3btoztxeytunvudc5dbn5twqodtonztc",
    apiUrl: "https://tolgee.sabagame.com/",
    projectId: "5",
    defaultNs: ResourceTypes.COMMON,
    ns: namespaces,
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

    languageCodes.forEach(async (languageId) => {
        await tg.changeLanguage(languageId);
        languages[languageId] = {};
        tg.getAllRecords().forEach((record) => {
            namespaces.forEach((namespace) => {
                if (record.namespace === namespace) {
                    languages[languageId][namespace] = {};
                    record.data.forEach((value, key) => {
                        languages[languageId][namespace][key] = value as string;
                    });
                    writeFile(`./public/i18n/${namespace}/` + languageId, JSON.stringify(languages[languageId][namespace], null, 4));
                }
            });
        });
    });

    console.log("Generated done!");
});
