import { fn } from 'jest-mock';

type CopyTextFunction = (text: string) => Promise<boolean>;

const FunctionUtil = {
    copyText: fn<CopyTextFunction>().mockResolvedValue(true),
};

export default FunctionUtil; 