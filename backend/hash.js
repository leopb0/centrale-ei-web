import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

const verifyPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

export { hashPassword, verifyPassword };
