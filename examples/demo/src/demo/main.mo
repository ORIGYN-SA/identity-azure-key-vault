import Principal "mo:base/Principal";

actor {
    // Return the principal identifier of the caller of this method.
    public shared (message) func whoami() : async Principal {
        return message.caller;
    };
};
