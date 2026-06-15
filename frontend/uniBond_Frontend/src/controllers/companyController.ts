import apiClient from "@/services/api/axiosClient";

export interface CompanyProfile {
  id: string;
  name: string;
  industry: string;
  description: string;
  location: string;
  website?: string;
  email: string;
}

const buildLocation = (city?: string, country?: string) =>
  [city, country].filter(Boolean).join(", ");

const parseCompanyDescription = (raw?: string | null) => {
  if (!raw) {
    return {
      name: "",
      industry: "Company",
      description: "No company description added yet.",
    };
  }

  const parts = raw.split("|").map((part) => part.trim()).filter(Boolean);
  return {
    name: parts[0] || "",
    industry: parts[1] || "Company",
    description: raw,
  };
};

const mapCompany = (user: any): CompanyProfile => {
  const parsed = parseCompanyDescription(user.description);
  const fallbackName = `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Company";

  return {
    id: String(user.id),
    name: parsed.name || fallbackName,
    industry: parsed.industry,
    description: parsed.description,
    location: buildLocation(user.city, user.country) || "Location not specified",
    website: user.website || undefined,
    email: user.email || "",
  };
};

export const handleGetCompanies = async (): Promise<CompanyProfile[]> => {
  const response = await apiClient.get("/users/", { params: { role: "company" } });
  return response.data.map(mapCompany);
};

export const handleGetCompanyById = async (id: string): Promise<CompanyProfile> => {
  const response = await apiClient.get(`/users/${id}`);
  return mapCompany(response.data);
};
