import apiClient from "@/services/api/axiosClient";
import type { Group, DiscussionMessage } from "@/types/group";

export const handleGetGroups = async (): Promise<Group[]> => {
  const res = await apiClient.get("/groups/");
  return res.data.map((g: any) => ({
    id: String(g.id),
    name: g.name,
    description: g.description || "",
    members: g.members?.map((m: any) => String(m.user_id)) || [],
    discussions: g.discussions?.map((d: any) => ({
      id: String(d.id),
      authorId: String(d.author_id),
      authorName: `User ${d.author_id}`,
      content: d.content,
      timestamp: d.timestamp
    })) || []
  }));
};

export const handleGetGroupById = async (id: string): Promise<Group | undefined> => {
  const res = await apiClient.get(`/groups/${id}`);
  const g = res.data;
  return {
    id: String(g.id),
    name: g.name,
    description: g.description || "",
    members: g.members?.map((m: any) => String(m.user_id)) || [],
    discussions: g.discussions?.map((d: any) => ({
      id: String(d.id),
      authorId: String(d.author_id),
      authorName: `User ${d.author_id}`,
      content: d.content,
      timestamp: d.timestamp
    })) || []
  };
};

export const handleCreateGroup = async (name: string, description: string, _creatorId: string): Promise<Group> => {
  const res = await apiClient.post("/groups/", { name, description });
  return handleGetGroupById(String(res.data.id)) as unknown as Group;
};

export const handleJoinGroup = async (groupId: string, _userId: string): Promise<Group> => {
  await apiClient.post(`/groups/${groupId}/join`);
  return handleGetGroupById(groupId) as unknown as Group;
};

export const handleAddMessage = async (groupId: string, _authorId: string, _authorName: string, content: string): Promise<DiscussionMessage> => {
  const res = await apiClient.post(`/groups/${groupId}/discussions`, { content });
  return {
    id: String(res.data.id),
    authorId: String(res.data.author_id),
    authorName: `User ${res.data.author_id}`,
    content: res.data.content,
    timestamp: res.data.timestamp
  };
};
