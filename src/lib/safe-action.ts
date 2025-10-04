import { createSafeActionClient, DEFAULT_SERVER_ERROR_MESSAGE } from "next-safe-action";

export class ActionError extends Error { }

export const createAction = createSafeActionClient({
    handleServerError: (error) => {
        if (error instanceof ActionError) {
            return error.message;
        }
        return DEFAULT_SERVER_ERROR_MESSAGE;
    },
});