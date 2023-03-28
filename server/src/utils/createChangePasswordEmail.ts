export const createChangePasswordEmail = (username: string, link:string) => {
    return `
        <p style=" font-family: 'Times New Roman'; "> 
            <strong>Hello, ${username}.</strong> We received a request for a new password for your account. 
            If you didn't make this request, ignore this email. If you did ask for a new password, click the
            link below.
        </p>
        <br>
        <a href="${link}" style="color:red;"> Create a new password. </a>
    `
}