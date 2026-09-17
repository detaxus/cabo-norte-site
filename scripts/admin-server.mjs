function sendHtml(response, html) {
  response.writeHead(200, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store',
  });

  response.end(html);
}

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {spawn} from 'node:child_process';

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

const buildScriptPath = path.join(
  projectRoot,
  'scripts',
  'build-kingdom-data.mjs'
);

const PORT = 8787;

/* =========================================================
   FILE HELPERS
   ========================================================= */

function readJson(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
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
      `Invalid JSON: ${filePath}`
    );
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(
    filePath,
    `${JSON.stringify(data, null, 2)}\n`,
    'utf8'
  );
}

function ensureDataDirectories() {
  fs.mkdirSync(
    path.dirname(applicationsPath),
    {recursive: true}
  );

  fs.mkdirSync(
    path.dirname(activitiesPath),
    {recursive: true}
  );

  if (!fs.existsSync(applicationsPath)) {
    writeJson(
      applicationsPath,
      {applications: []}
    );
  }

  if (!fs.existsSync(citizensPath)) {
    writeJson(
      citizensPath,
      {citizens: []}
    );
  }

  if (!fs.existsSync(activitiesPath)) {
    writeJson(
      activitiesPath,
      {activities: []}
    );
  }
}

/* =========================================================
   HTML / JSON HELPERS
   ========================================================= */

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function sendJson(
  response,
  statusCode,
  data
) {
  response.writeHead(
    statusCode,
    {
      'Content-Type':
        'application/json; charset=utf-8',

      'Cache-Control':
        'no-store',

      'Access-Control-Allow-Origin':
        '*',

      'Access-Control-Allow-Methods':
        'GET, POST, OPTIONS',

      'Access-Control-Allow-Headers':
        'Content-Type',
    }
  );

  response.end(
    JSON.stringify(data)
  );
}

/* =========================================================
   DATA ACCESS
   ========================================================= */

function getApplications() {
  const data =
    readJson(
      applicationsPath
    );

  return Array.isArray(
    data.applications
  )
    ? data.applications
    : [];
}

function getCitizens() {
  const data =
    readJson(
      citizensPath
    );

  return Array.isArray(
    data.citizens
  )
    ? data.citizens
    : [];
}

function getActivities() {
  const data =
    readJson(
      activitiesPath
    );

  return Array.isArray(
    data.activities
  )
    ? data.activities
    : [];
}

function getDashboard() {
  const applications =
    getApplications();

  const citizens =
    getCitizens();

  const activities =
    getActivities();

  return {
    applications,

    citizens,

    activities,

    pendingApplications:
      applications.filter(
        (application) =>
          application.status === 'pending' ||
          application.status ===
            'information_requested'
      ),

    activeCitizens:
      citizens.filter(
        (citizen) =>
          citizen.status === 'active'
      ),
  };
}

/* =========================================================
   BUILD PUBLIC DATA
   ========================================================= */

function runBuildData() {
  return new Promise(
    (resolve, reject) => {

      const child =
        spawn(
          process.execPath,
          [buildScriptPath],
          {
            cwd: projectRoot,
            stdio: 'pipe',
          }
        );

      let stdout = '';
      let stderr = '';

      child.stdout.on(
        'data',
        (chunk) => {
          stdout +=
            chunk.toString();
        }
      );

      child.stderr.on(
        'data',
        (chunk) => {
          stderr +=
            chunk.toString();
        }
      );

      child.on(
        'close',
        (code) => {

          if (code === 0) {
            resolve(stdout);
            return;
          }

          reject(
            new Error(
              stderr ||
              stdout ||
              `build:data failed with code ${code}`
            )
          );

        }
      );

    }
  );
}

/* =========================================================
   CITIZENSHIP DECISION
   ========================================================= */

function runDecision(
  applicationId,
  decision
) {
  return new Promise(
    (resolve, reject) => {

      const child =
        spawn(
          process.execPath,
          [
            path.join(
              projectRoot,
              'scripts',
              'decide-citizenship.mjs'
            ),
            applicationId,
            decision,
          ],
          {
            cwd: projectRoot,
            stdio: 'pipe',
          }
        );

      let stdout = '';
      let stderr = '';

      child.stdout.on(
        'data',
        (chunk) => {
          stdout +=
            chunk.toString();
        }
      );

      child.stderr.on(
        'data',
        (chunk) => {
          stderr +=
            chunk.toString();
        }
      );

      child.on(
        'close',
        (code) => {

          if (code === 0) {
            resolve(stdout);
            return;
          }

          reject(
            new Error(
              stderr ||
              stdout ||
              `Decision failed with code ${code}`
            )
          );

        }
      );

    }
  );
}

/* =========================================================
   CREATE PUBLIC APPLICATION
   ========================================================= */

function createApplication({
  fullName,
  publicName,
  email,
  discordUsername,
  languages,
  otherLanguages,
  hasMicronationCitizenship,
  micronationName,
  previousExperience,
  previousExperienceDetails,
  howFoundKingdom,
  howFoundOther,
  motivation,
  areasOfInterest,
  participationOther,
  contribution,
  awareOfDuties,
  commitmentAccepted,
}) {
  const data =
    readJson(
      applicationsPath
    );

  if (
    !Array.isArray(
      data.applications
    )
  ) {
    data.applications = [];
  }

  const numericIds =
    data.applications
      .map(
        (application) =>
          Number(
            String(
              application.id || ''
            ).replace(
              'CN-APP-',
              ''
            )
          )
      )
      .filter(
        Number.isFinite
      );

  const nextNumber =
    numericIds.length > 0
      ? Math.max(
          ...numericIds
        ) + 1
      : 1;

  const now =
    new Date().toISOString();

  const application = {
    id:
      `CN-APP-${String(
        nextNumber
      ).padStart(4, '0')}`,

    fullName:
      fullName.trim(),

    publicName:
      publicName.trim(),

    email:
      email.trim(),

    discordUsername:
      discordUsername.trim(),

    languages:
      languages.trim(),

    otherLanguages:
      otherLanguages.trim(),

    hasMicronationCitizenship:
      hasMicronationCitizenship.trim(),

    micronationName:
      micronationName.trim(),

    previousExperience:
      previousExperience.trim(),

    previousExperienceDetails:
      previousExperienceDetails.trim(),

    howFoundKingdom:
      howFoundKingdom.trim(),

    howFoundOther:
      howFoundOther.trim(),

    motivation:
      motivation.trim(),

    areasOfInterest:
      areasOfInterest.trim(),

    participationOther:
      participationOther.trim(),

    contribution:
      contribution.trim(),

    awareOfDuties:
      Boolean(awareOfDuties),

    commitmentAccepted:
      Boolean(commitmentAccepted),

    status:
      'pending',

    submittedAt:
      now,

    updatedAt:
      now,
  };

  data.applications.push(
    application
  );

  writeJson(
    applicationsPath,
    data
  );

  return application;
}

/* =========================================================
   ADMIN DASHBOARD HTML
   ========================================================= */

function pageTemplate(
  message = '',
  error = ''
) {
  const dashboard =
    getDashboard();

  const applicationsHtml =
    dashboard.pendingApplications.length === 0
      ? `
        <div class="empty">
          No pending applications.
        </div>
      `
      : dashboard.pendingApplications
          .map(
            (application) => `
              <article class="application">

                <div class="application-meta">
                  <span>
                    ${escapeHtml(
                      application.id
                    )}
                  </span>

                  <span>
                    ${escapeHtml(
                      application.status
                    )}
                  </span>
                </div>

                <h2>
                  ${escapeHtml(
                    application.publicName ||
                    'Unnamed applicant'
                  )}
                </h2>

                <div class="application-field">
                  <strong>Full name</strong>
                  <span>
                    ${escapeHtml(
                      application.fullName ||
                      'Not provided'
                    )}
                  </span>
                </div>

                <div class="application-field">
                  <strong>Public name</strong>
                  <span>
                    ${escapeHtml(
                      application.publicName ||
                      'Not provided'
                    )}
                  </span>
                </div>

                <div class="application-field">
                  <strong>Email</strong>
                  <span>
                    ${escapeHtml(
                      application.email ||
                      'Not provided'
                    )}
                  </span>
                </div>

                <div class="application-field">
                  <strong>Discord</strong>
                  <span>
                    ${escapeHtml(
                      application.discordUsername ||
                      'Not provided'
                    )}
                  </span>
                </div>

                <div class="application-field">
                  <strong>Languages</strong>
                  <span>
                    ${escapeHtml(
                      application.languages ||
                      'Not provided'
                    )}
                    ${
                      application.otherLanguages
                        ? ` — ${escapeHtml(
                            application.otherLanguages
                          )}`
                        : ''
                    }
                  </span>
                </div>

                <div class="application-field">
                  <strong>Other micronation</strong>
                  <span>
                    ${escapeHtml(
                      application.hasMicronationCitizenship ||
                      'Not provided'
                    )}
                    ${
                      application.micronationName
                        ? ` — ${escapeHtml(
                            application.micronationName
                          )}`
                        : ''
                    }
                  </span>
                </div>

                <div class="application-field">
                  <strong>Previous experience</strong>
                  <span>
                    ${escapeHtml(
                      application.previousExperience ||
                      'Not provided'
                    )}
                  </span>
                </div>

                ${
                  application.previousExperienceDetails
                    ? `
                      <div class="application-field">
                        <strong>Previous experience details</strong>
                        <p>
                          ${escapeHtml(
                            application.previousExperienceDetails
                          )}
                        </p>
                      </div>
                    `
                    : ''
                }

                <div class="application-field">
                  <strong>How they found Cabo Norte</strong>
                  <span>
                    ${escapeHtml(
                      application.howFoundKingdom ||
                      'Not provided'
                    )}
                    ${
                      application.howFoundOther
                        ? ` — ${escapeHtml(
                            application.howFoundOther
                          )}`
                        : ''
                    }
                  </span>
                </div>

                <div class="application-field">
                  <strong>Motivation</strong>
                  <p>
                    ${escapeHtml(
                      application.motivation ||
                      'No motivation provided.'
                    )}
                  </p>
                </div>

                <div class="application-field">
                  <strong>Areas of interest</strong>
                  <span>
                    ${escapeHtml(
                      application.areasOfInterest ||
                      'None specified'
                    )}
                    ${
                      application.participationOther
                        ? ` — ${escapeHtml(
                            application.participationOther
                          )}`
                        : ''
                    }
                  </span>
                </div>

                <div class="application-field">
                  <strong>Contribution</strong>
                  <p>
                    ${escapeHtml(
                      application.contribution ||
                      'No contribution described.'
                    )}
                  </p>
                </div>

                <div class="application-field">
                  <strong>Constitutional awareness</strong>
                  <span>
                    ${
                      application.awareOfDuties
                        ? 'Confirmed'
                        : 'Not confirmed'
                    }
                  </span>
                </div>

                <div class="application-field">
                  <strong>Commitment</strong>
                  <span>
                    ${
                      application.commitmentAccepted
                        ? 'Accepted'
                        : 'Not accepted'
                    }
                  </span>
                </div>

                <p class="submitted">
                  Submitted:
                  ${escapeHtml(
                    application.submittedAt
                  )}
                </p>

                <div class="actions">

                  <form
                    method="POST"
                    action="/decision"
                  >
                    <input
                      type="hidden"
                      name="applicationId"
                      value="${escapeHtml(
                        application.id
                      )}"
                    />

                    <input
                      type="hidden"
                      name="decision"
                      value="approve"
                    />

                    <button
                      class="approve"
                      type="submit"
                    >
                      Approve
                    </button>
                  </form>

                  <form
                    method="POST"
                    action="/decision"
                  >
                    <input
                      type="hidden"
                      name="applicationId"
                      value="${escapeHtml(
                        application.id
                      )}"
                    />

                    <input
                      type="hidden"
                      name="decision"
                      value="information"
                    />

                    <button
                      class="information"
                      type="submit"
                    >
                      Request information
                    </button>
                  </form>

                  <form
                    method="POST"
                    action="/decision"
                  >
                    <input
                      type="hidden"
                      name="applicationId"
                      value="${escapeHtml(
                        application.id
                      )}"
                    />

                    <input
                      type="hidden"
                      name="decision"
                      value="reject"
                    />

                    <button
                      class="reject"
                      type="submit"
                    >
                      Reject
                    </button>
                  </form>

                </div>

              </article>
            `
          )
          .join('');

  const citizensHtml =
    dashboard.activeCitizens.length === 0
      ? `
        <div class="empty">
          No active citizens.
        </div>
      `
      : dashboard.activeCitizens
          .map(
            (citizen) => `
              <article class="citizen">

                <span>
                  ${escapeHtml(
                    citizen.id
                  )}
                </span>

                <strong>
                  ${escapeHtml(
                    citizen.publicName ||
                    'Public name unavailable'
                  )}
                </strong>

                <small>
                  Admitted:
                  ${escapeHtml(
                    citizen.admittedAt
                  )}
                </small>

              </article>
            `
          )
          .join('');

  return `
<!DOCTYPE html>

<html lang="en">

<head>

  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>
    Cabo Norte — Administration
  </title>

  <style>

    :root {
      --green: #18352b;
      --gold: #b58a28;
      --cream: #f5f2e8;
      --white: #ffffff;
      --charcoal: #1b211e;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      background: var(--white);
      color: var(--charcoal);

      font-family:
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        "Segoe UI",
        sans-serif;
    }

    header {
      background: var(--green);
      color: var(--cream);

      padding: 2.3rem 1.5rem;

      border-bottom:
        4px solid
        var(--gold);
    }

    header .inner {
      width: min(1100px, 100%);
      margin: 0 auto;
    }

    header span {
      color: var(--gold);

      font-size: 0.68rem;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
    }

    header h1 {
      margin: 0.45rem 0 0;

      font-family:
        Georgia,
        "Times New Roman",
        serif;

      font-size: 2.4rem;
      font-weight: 500;
    }

    main {
      width:
        min(1100px, calc(100% - 2rem));

      margin: 0 auto;

      padding:
        2rem 0 4rem;
    }

    .notice,
    .error {
      margin-bottom:
        1rem;

      padding:
        0.9rem 1rem;

      font-size:
        0.84rem;
    }

    .notice {
      border-left:
        4px solid
        var(--gold);

      background:
        var(--cream);

      color:
        var(--green);
    }

    .error {
      border-left:
        4px solid
        var(--green);

      background:
        var(--cream);

      color:
        var(--charcoal);
    }

    /* =====================================================
       STATS
       ===================================================== */

    .stats {
      display:
        grid;

      grid-template-columns:
        repeat(3, 1fr);

      margin-bottom:
        2rem;

      border:
        1px solid
        var(--gold);
    }

    .stat {
      min-height:
        125px;

      padding:
        1.2rem;

      display:
        flex;

      flex-direction:
        column;

      justify-content:
        center;

      background:
        var(--cream);
    }

    .stat + .stat {
      border-left:
        1px solid
        rgba(181, 138, 40, 0.36);
    }

    .stat span {
      color:
        var(--gold);

      font-size:
        0.62rem;

      font-weight:
        800;

      letter-spacing:
        0.16em;

      text-transform:
        uppercase;
    }

    .stat strong {
      margin-top:
        0.25rem;

      color:
        var(--green);

      font-family:
        Georgia,
        "Times New Roman",
        serif;

      font-size:
        2.4rem;

      font-weight:
        500;
    }

    section {
      margin-top:
        2.4rem;
    }

    section h2 {
      margin:
        0 0 1rem;

      color:
        var(--green);

      font-family:
        Georgia,
        "Times New Roman",
        serif;

      font-size:
        1.55rem;

      font-weight:
        600;
    }

    /* =====================================================
       APPLICATION
       ===================================================== */

    .application {
      margin-bottom:
        0.9rem;

      padding:
        1.3rem;

      background:
        var(--cream);

      border:
        1px solid
        rgba(181, 138, 40, 0.45);
    }

    .application-meta {
      display:
        flex;

      justify-content:
        space-between;

      color:
        var(--gold);

      font-size:
        0.63rem;

      font-weight:
        800;

      letter-spacing:
        0.1em;

      text-transform:
        uppercase;
    }

    .application h2 {
      margin:
        0.75rem 0 1rem;

      color:
        var(--green);

      font-family:
        Georgia,
        "Times New Roman",
        serif;

      font-size:
        1.2rem;
    }

    .application-field {
      margin-top:
        0.8rem;
    }

    .application-field strong {
      display:
        block;

      margin-bottom:
        0.2rem;

      color:
        var(--gold);

      font-size:
        0.62rem;

      font-weight:
        800;

      letter-spacing:
        0.12em;

      text-transform:
        uppercase;
    }

    .application-field span,
    .application-field p {
      color:
        var(--charcoal);

      font-size:
        0.78rem;

      line-height:
        1.55;
    }

    .application-field p {
      margin:
        0;
    }

    .submitted {
      margin:
        1rem 0 0;

      color:
        #1b211e;

      font-size:
        0.68rem;
    }

    .actions {
      display:
        flex;

      flex-wrap:
        wrap;

      gap:
        0.6rem;

      margin-top:
        1rem;
    }

    button {
      min-height:
        38px;

      padding:
        0.5rem 0.85rem;

      border:
        1px solid
        var(--gold);

      border-radius:
        3px;

      background:
        var(--white);

      color:
        var(--green);

      font-size:
        0.7rem;

      font-weight:
        800;

      cursor:
        pointer;
    }

    button:hover {
      background:
        var(--gold);

      color:
        var(--white);
    }

    .approve {
      background:
        var(--green);

      color:
        var(--cream);
    }

    .information {
      background:
        var(--cream);
    }

    .reject {
      background:
        var(--white);
    }

    /* =====================================================
       CITIZENS
       ===================================================== */

    .citizen {
      display:
        grid;

      grid-template-columns:
        110px 1fr auto;

      align-items:
        center;

      gap:
        1rem;

      margin-bottom:
        0.9rem;

      padding:
        1.2rem;

      background:
        var(--cream);

      border:
        1px solid
        rgba(181, 138, 40, 0.45);
    }

    .citizen > span {
      color:
        var(--gold);

      font-size:
        0.66rem;

      font-weight:
        800;
    }

    .citizen strong {
      color:
        var(--green);

      font-family:
        Georgia,
        "Times New Roman",
        serif;

      font-size:
        1rem;

      font-weight:
        600;
    }

    .citizen small {
      color:
        var(--charcoal);

      font-size:
        0.68rem;
    }

    .empty {
      padding:
        1.4rem;

      background:
        var(--cream);

      border:
        1px dashed
        rgba(181, 138, 40, 0.55);

      color:
        var(--charcoal);

      font-size:
        0.78rem;
    }

    /* =====================================================
       MOBILE
       ===================================================== */

    @media (max-width: 750px) {

      .stats {
        grid-template-columns:
          1fr;
      }

      .stat + .stat {
        border-left:
          none;

        border-top:
          1px solid
          rgba(181, 138, 40, 0.36);
      }

      .citizen {
        grid-template-columns:
          1fr;

        gap:
          0.3rem;
      }

    }

  </style>

</head>

<body>

  <header>

    <div class="inner">

      <span>
        Kingdom of Cabo Norte
      </span>

      <h1>
        Administrative Office
      </h1>

    </div>

  </header>

  <main>

    ${
      message
        ? `
          <div class="notice">
            ${escapeHtml(message)}
          </div>
        `
        : ''
    }

    ${
      error
        ? `
          <div class="error">
            ${escapeHtml(error)}
          </div>
        `
        : ''
    }

    <!-- ===================================================
         STATS
         =================================================== -->

    <div class="stats">

      <div class="stat">

        <span>
          Pending Applications
        </span>

        <strong>
          ${dashboard.pendingApplications.length}
        </strong>

      </div>

      <div class="stat">

        <span>
          Active Citizens
        </span>

        <strong>
          ${dashboard.activeCitizens.length}
        </strong>

      </div>

      <div class="stat">

        <span>
          Public Activities
        </span>

        <strong>
          ${dashboard.activities.length}
        </strong>

      </div>

    </div>

    <!-- ===================================================
         APPLICATIONS
         =================================================== -->

    <section>

      <h2>
        Citizenship Applications
      </h2>

      ${applicationsHtml}

    </section>

    <!-- ===================================================
         CITIZENS
         =================================================== -->

    <section>

      <h2>
        Active Citizens
      </h2>

      ${citizensHtml}

    </section>

  </main>

</body>
</html>
`;
}

/* =========================================================
   HTTP BODY
   ========================================================= */

function parseBody(
  request
) {
  return new Promise(
    (resolve, reject) => {

      let body = '';

      request.on(
        'data',
        (chunk) => {

          body +=
            chunk.toString();

          if (
            body.length >
            100_000
          ) {
            reject(
              new Error(
                'Request body too large.'
              )
            );

            request.destroy();
          }

        }
      );

      request.on(
        'end',
        () => {

          try {

            const contentType =
              request.headers[
                'content-type'
              ] || '';

            if (
              contentType.includes(
                'application/json'
              )
            ) {
              resolve(
                JSON.parse(body)
              );

              return;
            }

            const params =
              new URLSearchParams(
                body
              );

            resolve(
              Object.fromEntries(
                params.entries()
              )
            );

          } catch (error) {
            reject(error);
          }

        }
      );

      request.on(
        'error',
        reject
      );

    }
  );
}

/* =========================================================
   SERVER
   ========================================================= */

ensureDataDirectories();

const server =
  http.createServer(
    async (
      request,
      response
    ) => {

      try {

        /* ---------------------------------------------
           CORS PREFLIGHT
           --------------------------------------------- */

        if (
          request.method === 'OPTIONS'
        ) {
          response.writeHead(
            204,
            {
              'Access-Control-Allow-Origin':
                '*',

              'Access-Control-Allow-Methods':
                'GET, POST, OPTIONS',

              'Access-Control-Allow-Headers':
                'Content-Type',
            }
          );

          response.end();

          return;
        }

        /* ---------------------------------------------
           ADMIN DASHBOARD
           --------------------------------------------- */

        if (
          request.method === 'GET' &&
          request.url.startsWith('/')
        ) {

          const url =
            new URL(
              request.url,
              `http://127.0.0.1:${PORT}`
            );

          const message =
            url.searchParams.get(
              'message'
            ) || '';

          sendHtml(
            response,
            pageTemplate(
              message,
              ''
            )
          );

          return;
        }

        /* ---------------------------------------------
           PUBLIC APPLICATION API
           --------------------------------------------- */

        if (
          request.method === 'POST' &&
          request.url === '/application'
        ) {

          const body =
            await parseBody(
              request
            );

          const fullName =
            String(
              body.fullName || ''
            ).trim();

          const publicName =
            String(
              body.publicName || ''
            ).trim();

          const email =
            String(
              body.email || ''
            ).trim();

          const discordUsername =
            String(
              body.discordUsername || ''
            ).trim();

          const languages =
            String(
              body.languages || ''
            ).trim();

          const otherLanguages =
            String(
              body.otherLanguages || ''
            ).trim();

          const hasMicronationCitizenship =
            String(
              body.hasMicronationCitizenship || ''
            ).trim();

          const micronationName =
            String(
              body.micronationName || ''
            ).trim();

          const previousExperience =
            String(
              body.previousExperience || ''
            ).trim();

          const previousExperienceDetails =
            String(
              body.previousExperienceDetails || ''
            ).trim();

          const howFoundKingdom =
            String(
              body.howFoundKingdom || ''
            ).trim();

          const howFoundOther =
            String(
              body.howFoundOther || ''
            ).trim();

          const motivation =
            String(
              body.motivation || ''
            ).trim();

          const areasOfInterest =
            String(
              body.areasOfInterest || ''
            ).trim();

          const participationOther =
            String(
              body.participationOther || ''
            ).trim();

          const contribution =
            String(
              body.contribution || ''
            ).trim();

          const awareOfDuties =
            Boolean(
              body.awareOfDuties
            );

          const commitmentAccepted =
            Boolean(
              body.commitmentAccepted
            );

          if (
            !fullName ||
            !email ||
            !discordUsername ||
            !languages ||
            !hasMicronationCitizenship ||
            !previousExperience ||
            !howFoundKingdom ||
            !motivation ||
            !awareOfDuties ||
            !commitmentAccepted
          ) {

            sendJson(
              response,
              400,
              {
                success: false,

                message:
                  'Preencha todos os campos obrigatórios da candidatura.',
              }
            );

            return;
          }

          if (
            hasMicronationCitizenship === 'Sim' &&
            !micronationName
          ) {

            sendJson(
              response,
              400,
              {
                success: false,

                message:
                  'Informe a micronação na qual possui cidadania ou vínculo formal.',
              }
            );

            return;
          }

          if (
            previousExperience === 'Sim' &&
            !previousExperienceDetails
          ) {

            sendJson(
              response,
              400,
              {
                success: false,

                message:
                  'Conte brevemente sobre sua experiência anterior.',
              }
            );

            return;
          }

          if (
            howFoundKingdom === 'Outro' &&
            !howFoundOther
          ) {

            sendJson(
              response,
              400,
              {
                success: false,

                message:
                  'Informe como você conheceu o Reino de Cabo Norte.',
              }
            );

            return;
          }

          if (fullName.length > 160) {
            sendJson(
              response,
              400,
              {
                success: false,
                message:
                  'O nome completo é muito longo.',
              }
            );

            return;
          }

          if (publicName.length > 120) {
            sendJson(
              response,
              400,
              {
                success: false,
                message:
                  'O nome de uso é muito longo.',
              }
            );

            return;
          }

          if (email.length > 254) {
            sendJson(
              response,
              400,
              {
                success: false,
                message:
                  'O endereço de e-mail é muito longo.',
              }
            );

            return;
          }

          if (discordUsername.length > 120) {
            sendJson(
              response,
              400,
              {
                success: false,
                message:
                  'O nome de usuário do Discord é muito longo.',
              }
            );

            return;
          }

          if (motivation.length > 3000) {
            sendJson(
              response,
              400,
              {
                success: false,
                message:
                  'A resposta sobre sua motivação é muito longa.',
              }
            );

            return;
          }

          if (contribution.length > 3000) {
            sendJson(
              response,
              400,
              {
                success: false,
                message:
                  'A resposta sobre sua contribuição é muito longa.',
              }
            );

            return;
          }

          const application =
            createApplication({
              fullName,
              publicName,
              email,
              discordUsername,
              languages,
              otherLanguages,
              hasMicronationCitizenship,
              micronationName,
              previousExperience,
              previousExperienceDetails,
              howFoundKingdom,
              howFoundOther,
              motivation,
              areasOfInterest,
              participationOther,
              contribution,
              awareOfDuties,
              commitmentAccepted,
            });

          sendJson(
            response,
            201,
            {
              success: true,

              applicationId:
                application.id,

              message:
                'Sua candidatura foi enviada para análise.',
            }
          );

          return;
        }

        /* ---------------------------------------------
           ADMIN DECISION
           --------------------------------------------- */

        if (
          request.method === 'POST' &&
          request.url === '/decision'
        ) {

          const body =
            await parseBody(
              request
            );

          const applicationId =
            String(
              body.applicationId || ''
            ).trim();

          const decision =
            String(
              body.decision || ''
            ).trim();

          if (
            !applicationId ||
            !decision
          ) {

            sendHtml(
              response,
              pageTemplate(
                '',
                'Invalid decision request.'
              )
            );

            return;
          }

          await runDecision(
            applicationId,
            decision
          );

          await runBuildData();

          response.writeHead(
            303,
            {
              Location:
                `/?message=${encodeURIComponent(
                  `Application ${applicationId} processed successfully.`
                )}`,
            }
          );

          response.end();

          return;
        }

        /* ---------------------------------------------
           404
           --------------------------------------------- */

        response.writeHead(
          404,
          {
            'Content-Type':
              'text/plain; charset=utf-8',
          }
        );

        response.end(
          'Not found'
        );

      } catch (error) {

        console.error(
          error
        );

        sendJson(
          response,
          500,
          {
            success: false,
            message:
              error.message ||
              'Internal server error.',
          }
        );

      }

    }
  );

server.listen(
  PORT,
  '127.0.0.1',
  () => {

    console.log('');
    console.log(
      'Cabo Norte Administrative Office'
    );
    console.log('');

    console.log(
      `Open: http://127.0.0.1:${PORT}`
    );

    console.log('');

    console.log(
      'This interface is LOCAL ONLY.'
    );

    console.log('');

  }
);
