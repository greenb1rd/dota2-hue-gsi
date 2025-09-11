import * as http from 'http';
import { EventEmitter } from 'events';
import { GameState, GameEvent } from './types/gsi-types';

export class GSIServer extends EventEmitter {
  private server: http.Server | null = null;

  start(port: number) {
    this.server = http.createServer((req, res) => {
      if (req.method === 'POST') {
        let body = '';
        
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        
        req.on('end', () => {
          try {
            const gameState = this.parseGameState(JSON.parse(body));
            this.emit('gamestate', gameState);
            res.writeHead(200);
            res.end();
          } catch (error) {
            console.error('Failed to parse GSI data:', error);
            res.writeHead(400);
            res.end();
          }
        });
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    this.server.listen(port);
  }

  parseGameState(data: any): GameState {
    return {
      provider: data.provider || {},
      map: {
        name: data.map?.name || '',
        matchid: data.map?.matchid || '',
        game_time: data.map?.game_time || 0,
        clock_time: data.map?.clock_time || 0,
        daytime: data.map?.daytime || false,
        nightstalker_night: data.map?.nightstalker_night || false,
        game_state: data.map?.game_state || '',
        paused: data.map?.paused || false,
        win_team: data.map?.win_team || '',
        radiant_win_chance: data.map?.radiant_win_chance || 0
      },
      player: data.player ? {
        steamid: data.player.steamid || '',
        name: data.player.name || '',
        activity: data.player.activity || '',
        kills: data.player.kills || 0,
        deaths: data.player.deaths || 0,
        assists: data.player.assists || 0,
        last_hits: data.player.last_hits || 0,
        denies: data.player.denies || 0,
        kill_streak: data.player.kill_streak || 0,
        commands_issued: data.player.commands_issued || 0,
        team_name: data.player.team_name || '',
        gold: data.player.gold || 0,
        gold_reliable: data.player.gold_reliable || 0,
        gold_unreliable: data.player.gold_unreliable || 0,
        gpm: data.player.gpm || 0,
        xpm: data.player.xpm || 0
      } : undefined,
      hero: data.hero ? {
        xpos: data.hero.xpos || 0,
        ypos: data.hero.ypos || 0,
        id: data.hero.id || 0,
        name: data.hero.name || '',
        level: data.hero.level || 0,
        alive: data.hero.alive || false,
        respawn_seconds: data.hero.respawn_seconds || 0,
        buyback_cost: data.hero.buyback_cost || 0,
        buyback_cooldown: data.hero.buyback_cooldown || 0,
        health: data.hero.health || 0,
        max_health: data.hero.max_health || 0,
        health_percent: data.hero.health_percent || 100,
        mana: data.hero.mana || 0,
        max_mana: data.hero.max_mana || 0,
        mana_percent: data.hero.mana_percent || 100,
        silenced: data.hero.silenced || false,
        stunned: data.hero.stunned || false,
        disarmed: data.hero.disarmed || false,
        magicimmune: data.hero.magicimmune || false,
        hexed: data.hero.hexed || false,
        muted: data.hero.muted || false,
        break: data.hero.break || false,
        has_debuff: data.hero.has_debuff || false
      } : undefined,
      abilities: data.abilities || {},
      items: data.items || {}
    };
  }

  detectEvents(previousState: GameState | null, currentState: GameState): GameEvent[] {
    const events: GameEvent[] = [];

    if (!previousState) {
      // First state received
      events.push({ type: 'game_started', timestamp: Date.now() });
      return events;
    }

    // Kill detection
    if (currentState.player && previousState.player) {
      if (currentState.player.kills > previousState.player.kills) {
        events.push({ 
          type: 'kill', 
          timestamp: Date.now(),
          data: { 
            killStreak: currentState.player.kill_streak 
          }
        });
      }
    }

    // Death detection
    if (currentState.hero && previousState.hero) {
      if (previousState.hero.alive && !currentState.hero.alive) {
        events.push({ 
          type: 'death', 
          timestamp: Date.now(),
          data: { 
            respawnTime: currentState.hero.respawn_seconds 
          }
        });
      }

      // Respawn detection
      if (!previousState.hero.alive && currentState.hero.alive) {
        events.push({ type: 'respawn', timestamp: Date.now() });
      }
    }

    // Ultimate ability used (simplified - checks for mana drop)
    if (currentState.hero && previousState.hero) {
      const manaDrop = previousState.hero.mana - currentState.hero.mana;
      if (manaDrop > 100 && currentState.hero.alive) {
        events.push({ type: 'ability_ultimate', timestamp: Date.now() });
      }
    }

    // Game state changes
    if (currentState.map && previousState.map) {
      // Game won
      if (!previousState.map.win_team && currentState.map.win_team) {
        const playerTeam = currentState.player?.team_name?.toLowerCase();
        const winningTeam = currentState.map.win_team.toLowerCase();
        const isVictory = playerTeam === winningTeam;
        
        events.push({ 
          type: isVictory ? 'victory' : 'defeat',
          timestamp: Date.now()
        });
      }

      // Game paused/unpaused
      if (previousState.map.paused !== currentState.map.paused) {
        events.push({ 
          type: currentState.map.paused ? 'game_paused' : 'game_unpaused',
          timestamp: Date.now()
        });
      }
    }

    return events;
  }

  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
  }
}