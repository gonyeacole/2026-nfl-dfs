-- CreateTable
CREATE TABLE "League" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'DFS DraftKings League',
    "numTeams" INTEGER NOT NULL DEFAULT 12,
    "buyIn" DECIMAL(10,2) NOT NULL DEFAULT 50,
    "playoffTeams" INTEGER NOT NULL DEFAULT 6,
    "regularSeasonWeeks" INTEGER NOT NULL DEFAULT 14,
    "weeklyMostPfPayout" DECIMAL(10,2) NOT NULL DEFAULT 6,
    "seasonMostPfPayout" DECIMAL(10,2) NOT NULL DEFAULT 48,
    "season1stPayout" DECIMAL(10,2) NOT NULL DEFAULT 270,
    "season2ndPayout" DECIMAL(10,2) NOT NULL DEFAULT 120,
    "season3rdPayout" DECIMAL(10,2) NOT NULL DEFAULT 60,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyScore" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "dfsScore" DECIMAL(7,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Team_name_idx" ON "Team"("name");

-- CreateIndex
CREATE INDEX "WeeklyScore_week_idx" ON "WeeklyScore"("week");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyScore_teamId_week_key" ON "WeeklyScore"("teamId", "week");

-- AddForeignKey
ALTER TABLE "WeeklyScore" ADD CONSTRAINT "WeeklyScore_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
