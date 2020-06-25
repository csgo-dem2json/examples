/*
 * Calculate whether winning pistol round was converted to a 3-0 score difference
 */

import { readFileSync } from 'fs';

if (process.argv.length !== 3) {
  console.log('Please specify the full path to a JSON file');
  console.log('e.g.: node pistol-round-won-convert-to-3-0.js json/liquid-vs-evil-geniuses-m3-inferno.json');

  process.exit(1);
}

const d = JSON.parse(readFileSync(process.argv[2], 'utf8'));

if (d.parser_name !== 'dem2json-events' || d.parser_version !== '0.0.x-dev') {
  throw new Error('Bad JSON version!');
}

let roundNum;
let overtime = false;
let postPistolRoundCount = 0;
let times = 0;
let winners = {};

d.events.forEach((e) => {
  if (e.type === 'round_start' || e.type === 'round_freeze_end') {
    if (e.round !== roundNum) {
      roundNum = e.round;

      if (roundNum === 0) {
        times = 0;
      }

      if (e.round > 30) {
        overtime = true;
      }

      postPistolRoundCount = (roundNum - 1) % 15;
      if (postPistolRoundCount === 0) {
        winners = {};
      }
    }
  }

  if (e.type === 'round_end') {
    if (!overtime && postPistolRoundCount < 3) {
      if (winners[e.winner] === undefined) {
        winners[e.winner] = 0;
      }

      winners[e.winner] += 1;

      if (postPistolRoundCount === 2) {
        for (const [_, wins] of Object.entries(winners)) {
          if (wins == 3) {
            times++;
          }
        }
      }
    }
  }
});

console.log(`${times} times`);
