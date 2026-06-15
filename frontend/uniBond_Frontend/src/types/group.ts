export interface DiscussionMessage {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  timestamp: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[]; // user IDs
  discussions: DiscussionMessage[];
}
