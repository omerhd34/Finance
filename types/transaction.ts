/**
 * REST API ve Redux’ta kullanılan işlem tipi.
 * JSON’da Date alanları ISO string gelir; Prisma Client’a bağlı olmadan kullanılır.
 */
export type Transaction = {
  id: string;
  type: string;
  amount: number;
  category: string;
  description: string | null;
  date: string;
  userId: string;
  createdAt: string;
};
