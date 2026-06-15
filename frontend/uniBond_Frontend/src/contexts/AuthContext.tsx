import { createContext } from "react";
import type { User } from "@/types/user";

export type AuthContextType = {
    user: User | null;
    login: (userData: any, token: string) => void;
    updateUser: (userData: User) => void;
    logout: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

