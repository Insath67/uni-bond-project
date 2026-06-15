import type { Role } from "@/types/user";
import Select from "./Select";

type Props = {
    value: Role;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
};

const roleOptions = [
    { value: "student", label: "🎓 Student" },
    { value: "lecturer", label: "🧑‍🏫 Lecturer" },
    { value: "company", label: "🏢 Company" },
    { value: "tech_lead", label: "👨‍💻 Tech Lead" },
    { value: "admin", label: "🛡️ Admin" },
];

export default function RoleSelector({ value, onChange }: Props) {
    return (
        <Select
            id="role"
            name="role"
            value={value}
            onChange={onChange}
            options={roleOptions}
            className="mb-3"
        />
    );
}