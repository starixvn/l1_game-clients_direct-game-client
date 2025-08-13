import { uniqueNamesGenerator } from "unique-names-generator";
import { NEW_202010 } from "./name-dictionaries/202010_new";
import { Animals } from "./name-dictionaries/animals";
import { Colors } from "./name-dictionaries/colors";
import { Cools } from "./name-dictionaries/cools";
import { Fruits } from "./name-dictionaries/fruits";
import { Marvels } from "./name-dictionaries/marvels";

export default class NameGenerator {
    public static PATTERN = "^[a-zA-Z0-9]{3,14}$";

    public static generateName(): string {
        const dictionaries = [Colors, Animals, Marvels, Fruits, Cools, NEW_202010];

        const randomDictionaryIndex = Math.floor(Math.random() * dictionaries.length); //NOSONAR
        const pickedDictionary = dictionaries[randomDictionaryIndex];

        const shortName = uniqueNamesGenerator({
            dictionaries: [pickedDictionary],
            separator: "",
            length: 1,
        });

        const numberLength = shortName.length < 10 ? 5 : 14 - shortName.length;
        let maxNumber = "";
        for (let i = 0; i < numberLength; i++) {
            maxNumber = `9${maxNumber}`;
        }
        const randomNumber = Math.floor(Math.random() * +maxNumber); //NOSONAR

        return `${shortName}${randomNumber}`;
    }

    public static validateName(name: string): boolean {
        const regex = new RegExp(NameGenerator.PATTERN);

        return (name || "").match(regex) !== null;
    }
}
