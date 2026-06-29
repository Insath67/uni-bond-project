import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/utils/constants";
import {
    Building2,
    Code2,
    GraduationCap,
    LibraryBig,
    LogIn,
} from "lucide-react";

const accountTypes = [
    {
        title: "Student",
        role: "student",
        icon: GraduationCap,
        description: "Join groups, find academic support, tasks, and opportunities.",
    },
    {
        title: "Lecturer",
        role: "lecturer",
        icon: LibraryBig,
        description: "Guide students, create academic spaces, and support collaboration.",
    },
    {
        title: "Company",
        role: "company",
        icon: Building2,
        description: "Publish opportunities and connect with skilled students.",
    },
    {
        title: "Tech Lead",
        role: "tech-lead",
        icon: Code2,
        description: "Mentor students and support technical learning.",
    },
];

export default function Register() {
    const navigate = useNavigate();

    return (
        <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.2),transparent_35%)] px-4 py-8 text-[var(--text-primary)]">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
                <div className="w-full rounded-[2rem] border border-white/10 bg-[var(--surface)]/70 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
                    <div className="mx-auto max-w-3xl text-center">
                        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">
                            UniBond
                        </p>

                        <h1 className="mt-4 text-4xl font-black tracking-tight text-[var(--text-primary)] sm:text-5xl">
                            Choose your account type
                        </h1>

                        <p className="mt-4 text-sm leading-7 text-[var(--text-secondary)] sm:text-base">
                            Select the role that matches you. Each account type has a different
                            registration form and approval process.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                        {accountTypes.map((type) => {
                            const Icon = type.icon;

                            return (
                                <button
                                    key={type.role}
                                    type="button"
                                    onClick={() => navigate(`/register/${type.role}`)}
                                    className="group rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-6 text-left transition hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
                                >
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)] transition group-hover:bg-[var(--brand)] group-hover:text-white">
                                        <Icon className="h-7 w-7" />
                                    </div>

                                    <h2 className="mt-5 text-xl font-black text-[var(--text-primary)]">
                                        {type.title}
                                    </h2>

                                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                                        {type.description}
                                    </p>

                                    <span className="mt-5 inline-flex text-sm font-bold text-[var(--accent)]">
                                        Continue →
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-10 flex justify-center">
                        <button
                            type="button"
                            onClick={() => navigate(ROUTES.LOGIN)}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--accent)]"
                        >
                            <LogIn className="h-4 w-4" />
                            Already have an account? Login here
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}