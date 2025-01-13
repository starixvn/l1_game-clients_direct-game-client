import { jest } from '@jest/globals';

type CopyTextFunction = (text: string) => Promise<boolean>;

const FunctionUtil = {
    copyText: jest.fn<CopyTextFunction>().mockResolvedValue(true),
};

export default FunctionUtil; 