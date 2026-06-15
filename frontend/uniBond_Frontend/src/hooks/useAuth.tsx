import { useState, useEffect, type ReactNode } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import type { User } from "@/types/user";
import apiClient from "@/services/api/axiosClient";
import { handlePresenceHeartbeat } from "@/controllers/userController";
import { mapApiUserToFrontendUser } from "@/models/userModel";

const mapUser = (data: any): User => mapApiUserToFrontendUser(data);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const res = await apiClient.get("/users/me");
                    setUser(mapUser(res.data));
                } catch (err) {
                    console.error("Failed to restore session", err);
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    useEffect(() => {
        if (!user) {
            return;
        }

        let intervalId: number | undefined;

        const beat = async () => {
            try {
                await handlePresenceHeartbeat();
            } catch (err) {
                console.error("Failed to update presence", err);
            }
        };

        void beat();
        intervalId = window.setInterval(() => {
            if (!document.hidden) {
                void beat();
            }
        }, 60000);

        const onVisibilityChange = () => {
            if (!document.hidden) {
                void beat();
            }
        };

        document.addEventListener("visibilitychange", onVisibilityChange);

        return () => {
            if (intervalId) {
                window.clearInterval(intervalId);
            }
            document.removeEventListener("visibilitychange", onVisibilityChange);
        };
    }, [user]);

    const login = (userData: any, token: string) => {
        setUser(mapUser(userData));
        localStorage.setItem("token", token);
    };

    const updateUser = (userData: User) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    if (loading) return null; // Or a nice Loader depending on app design

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
