import { HueController, RGB } from './hue-controller';
import { GameEvent, GameState } from './types/gsi-types';

export class EventMapper {
  private hue: HueController;
  private lastHealthUpdate: number = 0;

  constructor(hueController: HueController) {
    this.hue = hueController;
  }

  async handleEvent(event: GameEvent, state: GameState): Promise<void> {
    switch (event.type) {
      case 'game_started':
        await this.onGameStart();
        break;
      
      case 'kill':
        await this.onKill(event.data?.killStreak || 1);
        break;
      
      case 'death':
        await this.onDeath(event.data?.respawnTime || 0);
        break;
      
      case 'respawn':
        await this.onRespawn();
        break;
      
      case 'ability_ultimate':
        await this.onUltimate();
        break;
      
      case 'victory':
        await this.onVictory();
        break;
      
      case 'defeat':
        await this.onDefeat();
        break;
      
      case 'game_paused':
        await this.onPause();
        break;
      
      case 'game_unpaused':
        await this.onUnpause();
        break;
    }
  }

  async updateHealthEffect(healthPercent: number): Promise<void> {
    // Throttle health updates to avoid spamming
    const now = Date.now();
    if (now - this.lastHealthUpdate < 500) return;
    this.lastHealthUpdate = now;

    if (healthPercent < 20) {
      // Critical health - red pulse
      const intensity = 0.3 + (0.7 * (1 - healthPercent / 20));
      await this.hue.setLightColor(
        { r: 1.0, g: 0.0, b: 0.0 },
        intensity,
        2
      );
    } else if (healthPercent < 50) {
      // Low health - orange
      const r = 1.0;
      const g = 0.3 + (0.7 * (healthPercent / 50));
      await this.hue.setLightColor(
        { r, g, b: 0.0 },
        0.7,
        5
      );
    } else {
      // Good health - subtle green/white
      const g = 0.5 + (0.5 * (healthPercent / 100));
      await this.hue.setLightColor(
        { r: 0.8, g, b: 0.8 },
        0.6,
        10
      );
    }
  }

  private async onGameStart(): Promise<void> {
    console.log('   💡 Game started - initializing lights');
    // Gentle blue fade in
    await this.hue.setLightColor({ r: 0.2, g: 0.4, b: 1.0 }, 0.5, 30);
  }

  private async onKill(killStreak: number): Promise<void> {
    console.log(`   💡 Kill! Streak: ${killStreak}`);
    
    if (killStreak >= 5) {
      // Rampage! Epic rainbow effect
      await this.hue.rainbow(3000);
    } else if (killStreak >= 3) {
      // Killing spree - intense red flashes
      await this.hue.flash({ r: 1.0, g: 0.0, b: 0.0 }, 3, 200);
    } else {
      // Single kill - red pulse
      await this.hue.pulse({ r: 1.0, g: 0.1, b: 0.0 }, 800);
    }
  }

  private async onDeath(respawnTime: number): Promise<void> {
    console.log(`   💡 Death - respawn in ${respawnTime}s`);
    
    // Fade to darkness
    await this.hue.setLightColor({ r: 0.1, g: 0.0, b: 0.0 }, 0.2, 10);
    
    // Stay dark during death
    if (respawnTime > 5) {
      await this.sleep(3000);
      // Slowly brighten as respawn approaches
      await this.hue.setLightColor({ r: 0.3, g: 0.1, b: 0.1 }, 0.4, respawnTime * 10);
    }
  }

  private async onRespawn(): Promise<void> {
    console.log('   💡 Respawned!');
    // Bright white flash then fade to normal
    await this.hue.flash({ r: 1.0, g: 1.0, b: 1.0 }, 1, 300);
    await this.hue.setLightColor({ r: 0.8, g: 0.8, b: 0.8 }, 0.6, 10);
  }

  private async onUltimate(): Promise<void> {
    console.log('   💡 Ultimate ability used!');
    // Epic blue/purple effect
    await this.hue.pulse({ r: 0.4, g: 0.0, b: 1.0 }, 1500);
  }

  private async onVictory(): Promise<void> {
    console.log('   💡 VICTORY!');
    // Celebration rainbow
    for (let i = 0; i < 3; i++) {
      await this.hue.rainbow(2000);
    }
    // End on golden victory color
    await this.hue.setLightColor({ r: 1.0, g: 0.84, b: 0.0 }, 1.0, 20);
  }

  private async onDefeat(): Promise<void> {
    console.log('   💡 Defeat');
    // Slow fade to dim blue
    await this.hue.setLightColor({ r: 0.0, g: 0.0, b: 0.3 }, 0.3, 50);
  }

  private async onPause(): Promise<void> {
    console.log('   💡 Game paused');
    // Dim white
    await this.hue.setLightColor({ r: 0.5, g: 0.5, b: 0.5 }, 0.3, 10);
  }

  private async onUnpause(): Promise<void> {
    console.log('   💡 Game unpaused');
    // Return to normal
    await this.hue.setLightColor({ r: 0.8, g: 0.8, b: 0.8 }, 0.6, 10);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}