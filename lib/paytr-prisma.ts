import { prisma } from "@/lib/prisma";

export type PaytrOrderRow = {
  id: string;
  merchantOid: string;
  userId: string;
  amountKurus: number;
  status: string;
};

export const paytrDb = prisma as unknown as {
  paytrOrder: {
    findUnique(args: {
      where: { merchantOid: string };
    }): Promise<PaytrOrderRow | null>;
    create(args: {
      data: {
        merchantOid: string;
        userId: string;
        amountKurus: number;
        currency: string;
        status: string;
      };
    }): Promise<PaytrOrderRow>;
    update(args: {
      where: { id: string };
      data: { status?: string; completedAt?: Date | null };
    }): Promise<PaytrOrderRow>;
    deleteMany(args: {
      where: { merchantOid: string };
    }): Promise<{ count: number }>;
  };
};
