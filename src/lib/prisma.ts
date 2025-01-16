// DB CONNECTION WITH PRISMA IN REACT IS EASY 
//import { PrismaClient } from '@prisma/client'
// const prisma = new PrismaClient()

// BUT IN NEXT, NEXT RUNS ON EDGE RUN TIME MEAN IT HAVE TO CONNECT DB EVERY TIME WHEN WE4 HIT QUERY BUT FOR THIS WE HAVE USED THIS CODE FROM DOCS MEANS IF CONNECTION ALREADY THERE THEN USE IT OR ELSE CREATE NEW CONNECTION


import { PrismaClient } from '@prisma/client'
// Learn more:
// https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma