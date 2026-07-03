import { GraduationCap, Github, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="shrink-0 border-t border-[var(--border-soft)] bg-[var(--surface)]/70 px-6 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm text-[var(--text-secondary)] md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--brand)]/15 text-[var(--brand)]">
            <GraduationCap className="h-5 w-5" />
          </div>

          <div>
            <p className="font-bold text-[var(--text-primary)]">UniBond</p>
            <p className="text-xs">
              Connecting students, lecturers, and industry partners.
            </p>
          </div>
        </div>

        <p className="text-xs">© {currentYear} UniBond. All rights reserved.</p>

        <div className="flex items-center gap-4">
          <a
            href="mailto:support@unibond.com"
            className="flex items-center gap-2 transition hover:text-[var(--brand)]"
          >
            <Mail className="h-4 w-4" />
            Support
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 transition hover:text-[var(--brand)]"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}