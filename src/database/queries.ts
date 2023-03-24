export const CrownsQueries = {
  rank(userIDs?: string[]) {
    return `
    SELECT
      "count",
      rank,
      "totalCount",
      "totalUsers"
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          ORDER BY "count" DESC
        ) AS rank,
        count(*) OVER () AS "totalUsers",
        sum("count") OVER () AS "totalCount"
      FROM (
        SELECT count(*) AS "count", "userId"
        FROM crowns
        LEFT JOIN users u
          ON u.id = crowns."userId"
        WHERE crowns."serverID" = $1
          AND crowns."deletedAt" IS NULL
          ${userIDs ? 'AND "discordID" = ANY ($3)' : ""}
        GROUP BY "userId"
        ORDER BY 1 desc
      ) t
    ) ranks
    WHERE "userId" = $2
` as const;
  },

  guildAt(userIDs?: string[]) {
    return `
    SELECT
      "count",
      rank, 
      "discordID"
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (
          ORDER BY "count" DESC
        ) AS rank
      FROM (
        SELECT
          count(*) AS "count",
          "userId",
          "discordID"
        FROM crowns
        LEFT JOIN users u
          ON u.id = crowns."userId"
        WHERE crowns."serverID" = $1
          AND crowns."deletedAt" IS NULL
          ${userIDs ? 'AND "discordID" = ANY ($3)' : ""}
        GROUP BY "userId", "discordID"
        ORDER BY 1 desc
      ) t
    ) ranks
    OFFSET $2
    LIMIT 10
    ` as const;
  },

  guild(userIDs?: string[]) {
    return `
    SELECT
      count(*) AS "count",
      "userId",
      "discordID"
    FROM crowns c
    LEFT JOIN users u
      ON u.id = "userId"
    WHERE c."serverID" = $1
      AND c."deletedAt" IS NULL
      ${userIDs ? 'AND "discordID" = ANY ($2)' : ""}
    GROUP BY "userId", "discordID"
    ORDER BY count DESC
    ` as const;
  },

  crownRanks() {
    return `
    SELECT *
    FROM (
      SELECT
        "artistName",
        "userId",
        plays,
        ROW_NUMBER() OVER (
          ORDER BY plays DESC
        ) AS rank
      FROM crowns
      WHERE crowns."serverID" = $1
        AND crowns."deletedAt" IS NULL
    ) crowns
    WHERE "userId" = $2
    ORDER BY rank ASC
    LIMIT 15
      ` as const;
  },
} as const;
