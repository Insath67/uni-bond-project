import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleGetGroups, handleCreateGroup } from "@/controllers/groupController";
import type { Group } from "@/types/group";
import SectionCard from "@/components/common/SectionCard";
import { Users, MessagesSquare, AlertCircle } from "lucide-react";
import { validateGroupForm } from "@/utils/validators";

export default function Groups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Create state
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [createError, setCreateError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string }>({});

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const data = await handleGetGroups();
    setGroups(data);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!user) return;
     const validation = validateGroupForm(newGroupName, newGroupDesc);
     setFieldErrors(validation.errors);
     if (!validation.isValid) {
         setCreateError(validation.error ?? "Please correct the highlighted fields.");
         return;
     }
     try {
         setCreateError("");
         await handleCreateGroup(newGroupName, newGroupDesc, user.id);
         setNewGroupName("");
         setNewGroupDesc("");
         setFieldErrors({});
         fetchGroups();
     } catch (err: any) {
         setCreateError(err?.message || "Failed to create group");
     }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
      <div className="md:col-span-8 space-y-6">
         <div className="flex justify-between items-center mb-6 px-2">
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600"/> Study Groups
           </h1>
         </div>
         
         {loading ? (
             <div className="text-center py-10">Loading groups...</div>
         ) : groups.length === 0 ? (
             <SectionCard title="Groups">
                <p className="text-gray-500 text-center py-4">No groups yet.</p>
             </SectionCard>
         ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {groups.map(g => (
                 <div key={g.id} className="panel-surface rounded-2xl p-5 hover:border-[var(--brand)] cursor-pointer transition" onClick={() => navigate(`/groups/${g.id}`)}>
                    <h3 className="font-bold text-lg text-[var(--text-primary)] mb-2">{g.name}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-4 line-clamp-2">{g.description}</p>
                    <div className="flex justify-between items-center text-sm font-medium text-[var(--text-muted)] mt-auto border-t border-[var(--border-soft)] pt-3">
                       <span className="flex items-center gap-1"><Users className="w-4 h-4"/> {g.members.length} Members</span>
                       <span className="flex items-center gap-1"><MessagesSquare className="w-4 h-4"/> {g.discussions.length} Posts</span>
                    </div>
                 </div>
              ))}
            </div>
         )}
      </div>

      <div className="md:col-span-4">
         <SectionCard title="Create Group">
            <form onSubmit={handleCreate} className="space-y-4">
               {createError ? <div className="status-error"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{createError}</div> : null}
               <div>
                  <label className="field-label mb-1">Group Name</label>
                  <input className={`field-shell ${fieldErrors.name ? "field-shell-error" : ""}`} value={newGroupName} onChange={(e) => {
                    setNewGroupName(e.target.value);
                    setFieldErrors((current) => ({ ...current, name: undefined }));
                    setCreateError("");
                  }} placeholder="e.g. React Learners" required />
                  {fieldErrors.name ? <p className="field-error mt-1">{fieldErrors.name}</p> : null}
               </div>
               <div>
                  <label className="field-label mb-1">Description</label>
                  <textarea className={`field-shell ${fieldErrors.description ? "field-shell-error" : ""}`} rows={3} value={newGroupDesc} onChange={(e) => {
                    setNewGroupDesc(e.target.value);
                    setFieldErrors((current) => ({ ...current, description: undefined }));
                    setCreateError("");
                  }} placeholder="What is this group about?" required />
                  {fieldErrors.description ? <p className="field-error mt-1">{fieldErrors.description}</p> : <p className="field-hint mt-1">A strong group description makes it easier for the right students to join.</p>}
               </div>
               <button type="submit" className="btn-primary w-full py-3 disabled:opacity-50">
                 Create Group
               </button>
            </form>
         </SectionCard>
      </div>
    </div>
  );
}
