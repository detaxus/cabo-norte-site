import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const filePath = path.join(
  projectRoot,
  'src',
  'data',
  'activities.json'
);

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exit(1);
}

const [
  ,
  ,
  title,
  type = 'activity',
  meta = 'Kingdom',
  to = '/',
] = process.argv;

if (!title) {
  fail(
    'Usage: node scripts/add-activity.mjs "Title" [type] [meta] [path]'
  );
}

if (!fs.existsSync(filePath)) {
  fail(`File not found: ${filePath}`);
}

const data = JSON.parse(
  fs.readFileSync(filePath, 'utf8')
);

if (!Array.isArray(data.activities)) {
  fail('activities.json must contain an "activities" array.');
}

const id = `ACT-${Date.now()}`;

const activity = {
  id,
  date: new Date().toISOString(),
  type,
  title,
  meta,
  public: true,
  to,
};

data.activities.unshift(activity);

fs.writeFileSync(
  filePath,
  `${JSON.stringify(data, null, 2)}\n`,
  'utf8'
);

console.log('Activity added successfully.');
console.log(`ID: ${id}`);
console.log(`Title: ${title}`);
console.log(`Type: ${type}`);
console.log(`Meta: ${meta}`);
console.log(`Path: ${to}`);
