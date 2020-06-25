import { readFileSync } from 'fs';

if (process.argv.length !== 3) {
  console.log('Please specify the full path to a JSON file');
  console.log('e.g.: node chickens.js json/liquid-vs-evil-geniuses-m3-inferno.json');

  process.exit(1);
}

const d = JSON.parse(readFileSync(process.argv[2], 'utf8'));

if (d.parser_name !== 'dem2json-events' || d.parser_version !== '0.0.x-dev') {
  throw new Error('Bad JSON version!');
}

d.events.forEach((e) => {
  if (e.type === 'player_death' && e.attacker_player) {
    console.log(`${e.attacker_player.name} killed ${e.player.name} with ${e.weapon}`);
  }
});
