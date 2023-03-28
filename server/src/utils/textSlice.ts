export const textSlice = (text: string): string => {
    const words = text.split(" ");
    const sliced = words.slice(0, 30);
    return `${sliced.join(" ")}...`;
};
