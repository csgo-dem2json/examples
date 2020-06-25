import { readFileSync } from 'fs';

if (process.argv.length !== 3) {
  console.log('Please specify the full path to a JSON file');
  console.log('e.g.: node trades.js json/liquid-vs-evil-geniuses-m3-inferno.json');

  process.exit(1);
}

const d = JSON.parse(readFileSync(process.argv[2], 'utf8'));

if (d.parser_name !== 'dem2json-events' || d.parser_version !== '0.0.x-dev') {
  throw new Error('Bad JSON version!');
}

let lastDeath = null;
d.events.forEach((e) => {
  if (e.type === 'round_start') {
    lastDeath = null;
  }

  if (e.type === 'player_death') {
    if (!e.attacker_player) {
      return;
    }

    if (lastDeath) {
      const thisDeath = e;
      // Is the person being killed the one who killed last?
      if (thisDeath.player.steam64_id === lastDeath.attacker_player.steam64_id) {
        const timeDiff = thisDeath.time - lastDeath.time;

        let output = `${thisDeath.player.name} was traded by ${thisDeath.attacker_player.name} ${timeDiff}`;
        output += ` seconds after killing ${lastDeath.player.name}`;

        /* CSV output
        let output = [ thisDeath.player.name, thisDeath.attacker_player.name, timeDiff, lastDeath.player.name, ].join(',');
        */
        console.log(output);
      }
    }

    lastDeath = e;
  }
});
