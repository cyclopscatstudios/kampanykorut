import { v4 as uuidv4 } from "uuid";

export type IdGenerator = () => string;

export const uuidGenerator: IdGenerator = () => uuidv4();
