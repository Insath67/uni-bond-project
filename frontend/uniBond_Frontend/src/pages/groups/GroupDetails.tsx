import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuthHook";
import { handleGetGroupById, handleJoinGroup, handleAddMessage } from "@/controllers/groupController";
import type { Group } from "@/types/group";
import SectionCard from "@/components/common/SectionCard";
import { Users, ArrowLeft, Send } from "lucide-react";

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState<Group | null>(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
     if (id) {
         const data = await handleGetGroupById(id);
         setGroup(data || null);
     }
  };

  const onJoin = async () => {
    if (!user || !group) return;
    await handleJoinGroup(group.id, user.id);
    fetchGroup();
  };

  const onSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !group || !msg.trim()) return;
    await handleAddMessage(group.id, user.id, `${user.firstname} ${user.lastname}`, msg);
    setMsg("");
    fetchGroup();
  };

  if (!group) return <div className="p-10 text-center">Loading or Group not found</div>;

  const isMember = user ? group.members.includes(user.id) : false;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <button onClick={() => navigate("/groups")} className="flex items-center gap-2 text-gray-600 font-medium hover:text-blue-600 transition">
           <ArrowLeft className="w-4 h-4" /> Back to Groups
       </button>

       <div className="bg-white border rounded-xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
             <span className="flex items-center gap-2 text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-full"><Users className="w-4 h-4"/> {group.members.length} Members</span>
             {!isMember && user && (
                <button onClick={onJoin} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition">Join Group</button>
             )}
             {isMember && <span className="text-green-600 font-bold px-3 py-1 border border-green-200 bg-green-50 rounded-lg text-sm">You are a member</span>}
          </div>
       </div>

       <SectionCard title="Discussion Thread">
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 bg-gray-50 p-4 rounded-xl border border-gray-100">
             {group.discussions.length === 0 ? (
                <p className="text-gray-500 text-center py-10 font-medium">No discussions yet. Start one!</p>
             ) : (
                group.discussions.map(d => (
                   <div key={d.id} className={`flex flex-col ${d.authorId === user?.id ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-semibold text-gray-600">{d.authorId === user?.id ? "You" : d.authorName}</span>
                         <span className="text-[10px] text-gray-400 font-medium">{new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                      <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm font-medium shadow-sm leading-relaxed ${d.authorId === user?.id ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100'}`}>
                         {d.content}
                      </div>
                   </div>
                ))
             )}
          </div>

          {isMember ? (
             <form onSubmit={onSend} className="flex gap-3 pt-2">
                <input 
                   className="flex-1 px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition shadow-sm" 
                   placeholder="Type a message..." 
                   value={msg} 
                   onChange={(e) => setMsg(e.target.value)} 
                />
                <button type="submit" disabled={!msg.trim()} className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition disabled:opacity-50 shadow-sm flex items-center justify-center w-12 h-12">
                   <Send className="w-5 h-5 ml-1" />
                </button>
             </form>
          ) : (
             <div className="text-center p-4 bg-gray-50 text-gray-500 rounded-lg font-medium border border-gray-200 shadow-sm">
                Join the group to participate in discussions.
             </div>
          )}
       </SectionCard>
    </div>
  );
}
