import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');

const dataDir = path.join(
  projectRoot,
  'src',
  'data'
);

const privateDataDir = path.join(
  projectRoot,
  'private-data'
);

function readJson(
  filename,
  directory = dataDir
) {
  const filePath = path.join(
    directory,
    filename
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Arquivo não encontrado: ${filePath}`
    );
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        filePath,
        'utf8'
      )
    );
  } catch {
    throw new Error(
      `JSON inválido: ${filePath}`
    );
  }
}

function ensureArray(
  value,
  name
) {
  if (!Array.isArray(value)) {
    throw new Error(
      `O campo "${name}" precisa ser um array.`
    );
  }

  return value;
}

/* =========================================================
   RAW DATA
   ========================================================= */

const privateCitizensPath =
  path.join(
    privateDataDir,
    'citizens.json'
  );

const citizensData =
  fs.existsSync(
    privateCitizensPath
  )
    ? readJson(
        'citizens.json',
        privateDataDir
      )
    : readJson(
        'citizens.json',
        dataDir
      );

const diplomacyData =
  readJson(
    'diplomacy.json'
  );

const institutionsData =
  readJson(
    'institutions.json'
  );

const activitiesData =
  readJson(
    'activities.json'
  );

const citizens =
  ensureArray(
    citizensData.citizens,
    'citizens'
  );

const relations =
  ensureArray(
    diplomacyData.relations,
    'relations'
  );

const institutions =
  ensureArray(
    institutionsData.institutions,
    'institutions'
  );

const districts =
  ensureArray(
    institutionsData.districts,
    'districts'
  );

const activities =
  ensureArray(
    activitiesData.activities,
    'activities'
  );

/* =========================================================
   ACTIVE RECORDS
   ========================================================= */

const activeCitizens =
  citizens.filter(
    (citizen) =>
      citizen.status === 'active'
  );

const activeRelations =
  relations.filter(
    (relation) =>
      relation.status === 'active'
  );

const activeDistricts =
  districts.filter(
    (district) =>
      district.status === 'active'
  );

/* =========================================================
   PUBLIC ACTIVITIES
   ========================================================= */

const publicActivities =
  activities
    .filter(
      (activity) =>
        activity.public !== false
    )
    .sort(
      (a, b) =>
        new Date(
          b.date || 0
        ).getTime() -
        new Date(
          a.date || 0
        ).getTime()
    );

/* =========================================================
   PUBLIC ACTS
   ========================================================= */

const publicActs =
  publicActivities.filter(
    (activity) =>
      [
        'act',
        'decree',
        'law',
      ].includes(
        activity.type
      )
  );

/* =========================================================
   CURRENT ACTIVITY
   ========================================================= */

const currentActivity =
  publicActivities.length > 0
    ? publicActivities[0]
    : null;

/* =========================================================
   RECENT DEVELOPMENTS
   ========================================================= */

const recentActivity =
  publicActivities
    .slice(0, 5)
    .map(
      (activity) => ({
        id:
          activity.id ||
          null,

        title:
          activity.title,

        meta:
          activity.meta ||
          activity.type ||
          'Kingdom',

        to:
          activity.to ||
          '/',

        date:
          activity.date ||
          null,
      })
    );

/* =========================================================
   KINGDOM STATE
   ========================================================= */

const kingdom = {
  citizens:
    activeCitizens.length,

  publicActs:
    publicActs.length,

  diplomaticRelations:
    activeRelations.length,

  activeDistricts:
    activeDistricts.length,

  institutions:
    institutions.length,

  currentActivity:
    currentActivity
      ? currentActivity.title
      : null,

  lastUpdate:
    currentActivity
      ? currentActivity.date
      : null,

  recentActivity,
};

/* =========================================================
   OUTPUT
   ========================================================= */

const outputPath =
  path.join(
    dataDir,
    'kingdom-data.json'
  );

fs.writeFileSync(
  outputPath,
  `${JSON.stringify(
    kingdom,
    null,
    2
  )}\n`,
  'utf8'
);

console.log(
  'Kingdom data generated successfully.'
);

console.log(
  `Citizens: ${kingdom.citizens}`
);

console.log(
  `Public acts: ${kingdom.publicActs}`
);

console.log(
  `Diplomatic relations: ${kingdom.diplomaticRelations}`
);

console.log(
  `Active districts: ${kingdom.activeDistricts}`
);

console.log(
  `Public activities: ${publicActivities.length}`
);
