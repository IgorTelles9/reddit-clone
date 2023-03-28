import { Box } from "@chakra-ui/react";
import React from "react";

export type WrapperSize = "sm" | "md"; 

interface WrapperProps {
    children: any;
    size?: WrapperSize; 
}

const Register: React.FC<WrapperProps> = ({ children, size = "md" }) => {
    return (
        <Box mt={8} mx="auto" maxW={size === "md" ? "800px" : "400px"} w="100%">
            {children}
        </Box>
    );
};
export default Register;
