"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function addTeam(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const owner = String(formData.get("owner") ?? "").trim();
  if (!name) throw new Error("Team name is required");

  await prisma.team.create({ data: { name, owner: owner || null } });
  revalidatePath("/teams");
  revalidatePath("/");
  revalidatePath("/standings");
  revalidatePath("/playoffs");
}

export async function deleteTeam(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing team id");

  await prisma.team.delete({ where: { id } });
  revalidatePath("/teams");
  revalidatePath("/");
  revalidatePath("/standings");
  revalidatePath("/playoffs");
}

export async function upsertWeeklyScores(formData: FormData) {
  const week = Number(formData.get("week"));
  if (!Number.isInteger(week) || week < 1) throw new Error("Invalid week");

  const teamIds = formData.getAll("teamId").map(String);
  await Promise.all(
    teamIds.map(async (teamId) => {
      const raw = formData.get(`score-${teamId}`);
      if (raw === null || raw === "") return;
      const dfsScore = Number(raw);
      if (Number.isNaN(dfsScore)) return;

      await prisma.weeklyScore.upsert({
        where: { teamId_week: { teamId, week } },
        update: { dfsScore },
        create: { teamId, week, dfsScore },
      });
    }),
  );

  revalidatePath("/scores");
  revalidatePath("/standings");
  revalidatePath("/playoffs");
  revalidatePath("/");
}

export async function updateLeagueSettings(formData: FormData) {
  const numTeams = Number(formData.get("numTeams"));
  const buyIn = Number(formData.get("buyIn"));
  const playoffTeams = Number(formData.get("playoffTeams"));
  const regularSeasonWeeks = Number(formData.get("regularSeasonWeeks"));
  const weeklyMostPfPayout = Number(formData.get("weeklyMostPfPayout"));
  const seasonMostPfPayout = Number(formData.get("seasonMostPfPayout"));
  const season1stPayout = Number(formData.get("season1stPayout"));
  const season2ndPayout = Number(formData.get("season2ndPayout"));
  const season3rdPayout = Number(formData.get("season3rdPayout"));

  await prisma.league.upsert({
    where: { id: 1 },
    update: {
      numTeams,
      buyIn,
      playoffTeams,
      regularSeasonWeeks,
      weeklyMostPfPayout,
      seasonMostPfPayout,
      season1stPayout,
      season2ndPayout,
      season3rdPayout,
    },
    create: {
      id: 1,
      numTeams,
      buyIn,
      playoffTeams,
      regularSeasonWeeks,
      weeklyMostPfPayout,
      seasonMostPfPayout,
      season1stPayout,
      season2ndPayout,
      season3rdPayout,
    },
  });

  revalidatePath("/");
  revalidatePath("/settings");
}
