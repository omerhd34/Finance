/**
 * REST API ve Redux’ta kullanılan hedef tipi.
 */
export type Goal = {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  userId: string;
  createdAt: string;
};
