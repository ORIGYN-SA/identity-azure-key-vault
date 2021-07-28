import {IDL} from '@dfinity/candid';

export const idlFactory = () => {
    return IDL.Service({
        'whoami' : IDL.Func([], [IDL.Principal], []),
    });
};
