import kingdomData from './kingdom-data.json';

/* =========================================================
   PUBLIC KINGDOM DATA
   ========================================================= */

const kingdom = {
  citizens:
    kingdomData.citizens ?? 0,

  publicActs:
    kingdomData.publicActs ?? 0,

  diplomaticRelations:
    kingdomData.diplomaticRelations ?? 0,

  activeDistricts:
    kingdomData.activeDistricts ?? 0,

  institutions:
    kingdomData.institutions ?? 0,

  discordMembers:
    kingdomData.discordMembers ?? null,

  currentActivity:
    kingdomData.currentActivity ?? null,

  lastUpdate:
    kingdomData.lastUpdate ?? null,

  recentActivity:
    Array.isArray(kingdomData.recentActivity)
      ? kingdomData.recentActivity
      : [],
};

export default kingdom;
