export type ItemType = "note" | "link" | "insight";

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: ItemType;
  sourceUrl: string | null;
  summary: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface KnowledgeItemWithTags extends KnowledgeItem {
  tags: Tag[];
}

export interface ApiItemCreate {
  title: string;
  content: string;
  type: ItemType;
  sourceUrl?: string;
  tags?: string[];
}
