import {
    FormControl,
    FormLabel,
    Input,
    FormErrorMessage,
    Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    name: string;
    label: string;
    textarea?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    textarea,
    size: _,
    ...props
}) => {
    let InputOrTextarea = Input as any;
    if (textarea) InputOrTextarea = Textarea;

    const [field, { error }] = useField(props);
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel>{label}</FormLabel>
            <InputOrTextarea
                {...field}
                {...props}
                type={!!props.type ? props.type : "text"}
                id={field.name}
                placeholder={props.placeholder}
            />
            <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
    );
};
export default InputField;
