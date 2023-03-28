import { Box, Button, Flex } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import InputField from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { toErrorMap } from "../utils/toErrorMap";
import NextLink from "next/link";
import Layout from "../components/Layout";

const Login: React.FC<{}> = ({}) => {
    const router = useRouter();
    const [, login] = useLoginMutation();
    return (
        <Layout size="sm">
            <Formik
                initialValues={{ usernameOrEmail: "", password: "" }}
                onSubmit={async (values, { setErrors }) => {
                    const response = await login({
                        usernameOrEmail: values.usernameOrEmail,
                        password: values.password,
                    });
                    if (response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors));
                    } else if (response.data.login.user) {
                        if (typeof router.query.next === "string")
                            router.push(router.query.next);
                        else router.push("/");
                    }
                }}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <InputField
                            name="usernameOrEmail"
                            placeholder="username or email"
                            label="Username or Email"
                        ></InputField>
                        <Box mt={4}>
                            <InputField
                                name="password"
                                placeholder="password"
                                label="Password"
                                type="password"
                            ></InputField>
                        </Box>
                        <Flex>
                            <Box ml="auto">
                                <NextLink href="/forgot-password">
                                    <Box mt={2} fontSize="0.875rem">
                                        forgot your password?
                                    </Box>
                                </NextLink>
                            </Box>
                        </Flex>
                        <Button
                            mt={2}
                            isLoading={isSubmitting}
                            type="submit"
                            colorScheme="teal"
                        >
                            Login
                        </Button>
                    </Form>
                )}
            </Formik>
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(Login);
