import { FieldError } from "src/types/error-types";
import { UsernamePasswordInput } from "./../types/user-types";

export const preValidateRegister = (
    options: UsernamePasswordInput
): FieldError[] | null => {
    if (options.username.length < 3) {
        return [
            {
                field: "username",
                message: "username should have at least 3 characters",
            },
        ];
    } else if (options.username.includes("@")) {
        return [
            {
                field: "username",
                message: "username can't contain special character '@' ",
            },
        ];
    }

    if (options.password.length < 3) {
        return [
            {
                field: "password",
                message: "password should have at least 3 characters",
            },
        ];
    } 

    if (!options.email.includes("@")) {
        return [
            {
                field: "email",
                message: "invalid email",
            },
        ];
    }

    return null;
};
