"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AbstractedAdminError extends Error {
    constructor(message, name = "abstracted-admin/error") {
        super(message);
        this.firemodel = true;
        this.name = name;
        this.code = name.split("/").pop();
    }
}
exports.AbstractedAdminError = AbstractedAdminError;
