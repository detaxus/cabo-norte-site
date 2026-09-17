import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();

const applicationsPath = path.join(
  projectRoot,
  'private-data',
  'applications.json'
);

const citizensPath = path.join(
  projectRoot,
  'private-data',
  'citizens.json'
);

const activitiesPath = path.join(
  projectRoot,
  'src',
  'data',
  'activities.json'
);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`File not found: ${filePath}`);
  }

  try {
    return JSON.parse(
      fs.readFileSync(filePath, 'utf8')
    );
  } catch {
    fail(`Invalid JSON: ${filePath}`);
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8'
  );
}

const [
  ,
  ,
  applicationId,
  decision,
] = process.argv;

const validDecisions = [
  'approve',
  'reject',
  'information',
];

if (!applicationId || !decision) {
  fail(
    'Usage: node scripts/decide-citizenship.mjs APPLICATION_ID approve|reject|information'
  );
}

if (!validDecisions.includes(decision)) {
  fail(
    `Invalid decision "${decision}". Use approve, reject or information.`
  );
}

const applicationsData =
  readJson(applicationsPath);

const citizensData =
  readJson(citizensPath);

const activitiesData =
  readJson(activitiesPath);

if (!Array.isArray(applicationsData.applications)) {
  fail(
    'applications.json must contain an "applications" array.'
  );
}

if (!Array.isArray(citizensData.citizens)) {
  fail(
    'citizens.json must contain a "citizens" array.'
  );
}

if (!Array.isArray(activitiesData.activities)) {
  fail(
    'activities.json must contain an "activities" array.'
  );
}

const applicationIndex =
  applicationsData.applications.findIndex(
    (application) =>
      application.id === applicationId
  );

if (applicationIndex === -1) {
  fail(
    `Application not found: ${applicationId}`
  );
}

const application =
  applicationsData.applications[
    applicationIndex
  ];

if (
  application.status !== 'pending' &&
  application.status !== 'information_requested'
) {
  fail(
    `Application ${applicationId} is not awaiting a decision.`
  );
}

const now =
  new Date().toISOString();

/* =========================================================
   REQUEST MORE INFORMATION
   ========================================================= */

if (decision === 'information') {
  application.status =
    'information_requested';

  application.updatedAt =
    now;

  writeJson(
    applicationsPath,
    applicationsData
  );

  console.log(
    `Application ${applicationId} marked as requiring more information.`
  );

  process.exit(0);
}

/* =========================================================
   REJECT
   ========================================================= */

if (decision === 'reject') {
  application.status =
    'rejected';

  application.decidedAt =
    now;

  application.updatedAt =
    now;

  writeJson(
    applicationsPath,
    applicationsData
  );

  console.log(
    `Application ${applicationId} rejected.`
  );

  process.exit(0);
}

/* =========================================================
   APPROVE
   ========================================================= */

if (decision === 'approve') {

  const existingCitizen =
    citizensData.citizens.find(
      (citizen) =>
        citizen.applicationId ===
        applicationId
    );

  if (existingCitizen) {
    fail(
      `Application ${applicationId} has already created a citizen record.`
    );
  }

  const nextCitizenNumber =
    citizensData.citizens.length + 1;

  const citizenId =
    `CN-${String(nextCitizenNumber).padStart(4, '0')}`;

  const citizen = {
    id: citizenId,
    applicationId,
    status: 'active',
    publicName:
      application.publicName || null,
    admittedAt:
      now.slice(0, 10)
  };

  citizensData.citizens.push(
    citizen
  );

  application.status =
    'approved';

  application.decidedAt =
    now;

  application.updatedAt =
    now;

  /* ---------------------------------------------
     PUBLIC ACTIVITY
     --------------------------------------------- */

  const citizenDisplayName =
    application.publicName ||
    application.fullName;

  const activity = {
    id:
      `ACT-${Date.now()}`,

    date:
      now,

    type:
      'citizenship',

    title:
      `New citizen admitted: ${citizenDisplayName}`,

    meta:
      'Citizenship',

    public:
      true,

    to:
      '/cidadania'
  };

  activitiesData.activities.unshift(
    activity
  );

  writeJson(
    citizensPath,
    citizensData
  );

  writeJson(
    applicationsPath,
    applicationsData
  );

  writeJson(
    activitiesPath,
    activitiesData
  );

  console.log(
    'Citizenship approved successfully.'
  );

  console.log(
    `Application: ${applicationId}`
  );

  console.log(
    `Citizen ID: ${citizenId}`
  );

  console.log(
    `Public activity: ${activity.title}`
  );

  process.exit(0);
}
