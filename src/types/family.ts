export type Gender = 'male' | 'female';
export type RelationType = 'blood' | 'partner';

export interface Person {
  id: string;
  name: string;
  gender: Gender;
  birthDate?: string | null;
  deathDate?: string | null;
  photoUrl?: string | null;
  address?: string;
  relationType: RelationType;
  parents: string[];
  children: string[];
  spouses: string[];
  [key: string]: unknown;
}

export type PersonNodeData = Person & {
  onAddChild?: (parentId: string) => void;
  onAddPartner?: (partnerId: string) => void;
  onViewDetails?: (personId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  isAdmin?: boolean;
  isDarkMode?: boolean;
};
