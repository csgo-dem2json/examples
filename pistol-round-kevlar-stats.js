/*
 * Calculate whether kevlar was a waste of money for pistol rounds
 *
 * We need to track a few things for this
 * - is it pistol round?
 * - maybe if the person had kevlar
 * - definitely if the person got headshot
 */

import { readFileSync } from 'fs';

if (process.argv.length !== 3) {
  console.log('Please specify the full path to a JSON file');
  console.log('e.g.: node pistol-round-kevlar-stats.js json/liquid-vs-evil-geniuses-m3-inferno.json');

  process.exit(1);
}

const d = JSON.parse(readFileSync(process.argv[2], 'utf8'));

if (d.parser_name !== 'dem2json-events' || d.parser_version !== '0.0.x-dev') {
  throw new Error('Bad JSON version!');
}

let roundNum;
let pistolRound = false;
let playersWithKevlar = {};
let playersThatGotHeadshot = {};

d.events.forEach((e) => {
  if (e.type === 'round_start' || e.type === 'round_freeze_end') {
    if (e.round !== roundNum) {
      roundNum = e.round;

      playersWithKevlar = {};
      playersThatGotHeadshot = {};

      // Can't this just be if 1 or 16?
      pistolRound = ((roundNum < 30) && ((roundNum - 1) % 15 === 0));
    }
  }

  if (!pistolRound) {
    return;
  }

  if (e.type === 'item_pickup' && e.item === 'vest') {
    // console.log(`${roundNum}: ${e.player.name} picked up a ${e.item}`)
    playersWithKevlar[e.player.steam64_id] = true;
  }

  if (e.type === 'player_hurt') {
    // Don't bother if there's no attacker player
    if (!e.attacker_player) {
      return;
    }

    if (e.hitgroup === 'Head') {
      // console.log(`${e.player.name} took ${e.dmg_health} HP damage from a headshot. (health=${e.health} (armor=${e.player.armor}))`)
      playersThatGotHeadshot[e.player.steam64_id] = true;
    }
  }

  if (e.type === 'player_death') {
    // Don't bother if there's no attacker player
    if (!e.attacker_player) {
      return;
    }

    if (e.headshot === true) {
      if (playersWithKevlar[e.player.steam64_id] !== undefined) {
        // console.log(`${roundNum}: ${e.player.name} died to a headshot, so didn't need kevlar`)
        console.log(`${e.player.name}, definitely`);
      }
    } else if (playersThatGotHeadshot[e.player.steam64_id] !== undefined) {
      // console.log(`${roundNum}: ${e.player.name} died, and took a headshot earlier in the round, so maybe didn't need kevlar`)
      console.log(`${e.player.name}, maybe`);
    }
  }
});
