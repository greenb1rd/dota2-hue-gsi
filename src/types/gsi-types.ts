export interface GameState {
  provider?: {
    name?: string;
    appid?: number;
    version?: number;
    timestamp?: number;
  };
  map?: {
    name: string;
    matchid: string;
    game_time: number;
    clock_time: number;
    daytime: boolean;
    nightstalker_night: boolean;
    game_state: string;
    paused: boolean;
    win_team: string;
    radiant_win_chance: number;
  };
  player?: {
    steamid: string;
    name: string;
    activity: string;
    kills: number;
    deaths: number;
    assists: number;
    last_hits: number;
    denies: number;
    kill_streak: number;
    commands_issued: number;
    team_name: string;
    gold: number;
    gold_reliable: number;
    gold_unreliable: number;
    gpm: number;
    xpm: number;
  };
  hero?: {
    xpos: number;
    ypos: number;
    id: number;
    name: string;
    level: number;
    alive: boolean;
    respawn_seconds: number;
    buyback_cost: number;
    buyback_cooldown: number;
    health: number;
    max_health: number;
    health_percent: number;
    mana: number;
    max_mana: number;
    mana_percent: number;
    silenced: boolean;
    stunned: boolean;
    disarmed: boolean;
    magicimmune: boolean;
    hexed: boolean;
    muted: boolean;
    break: boolean;
    has_debuff: boolean;
  };
  abilities?: {
    [key: string]: {
      name: string;
      level: number;
      can_cast: boolean;
      passive: boolean;
      ability_active: boolean;
      cooldown: number;
      ultimate: boolean;
    };
  };
  items?: {
    [key: string]: {
      name: string;
      purchaser?: number;
      can_cast?: boolean;
      cooldown?: number;
      passive?: boolean;
      charges?: number;
    };
  };
}

export interface GameEvent {
  type: 
    | 'game_started'
    | 'kill'
    | 'death'
    | 'respawn'
    | 'ability_ultimate'
    | 'victory'
    | 'defeat'
    | 'game_paused'
    | 'game_unpaused';
  timestamp: number;
  data?: any;
}