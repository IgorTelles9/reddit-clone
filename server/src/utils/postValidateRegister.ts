import { FieldError } from './../types/error-types';
export const postValidateRegister = (err: any): FieldError[] | null => {
    if (err.code === "23505") {
        if (err.detail.includes("Key (email)")){
            return [
                    {
                        field: "email",
                        message: "email already registered in an account"
                    }
                ]

        }
        
        else if (err.detail.includes("Key (username)")){
            return [
                    {
                        field: "username",
                        message: "username already exists",
                    },
                ]
        }
    }

    return null;
}