import * as http from 'http';
import { GSIServer } from './gsi-server';
import { HueController } from './hue-controller';
import { EventMapper } from './event-mapper';
import { GameState } from './types/gsi-types';
import * as dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.GSI_PORT ? parseInt(process.env.GSI_PORT) : 3000;
const HUE_BRIDGE_IP = process.env.HUE_BRIDGE_IP || '';
const HUE_USERNAME = process.env.HUE_USERNAME || '';

class Dota2HueGSI {
  private gsiServer: GSIServer;
  private hueController: HueController;
  private eventMapper: EventMapper;
  private previousState: GameState | null = null;
  private isConnected: boolean = false;

  constructor() {
    this.gsiServer = new GSIServer();
    this.hueController = new HueController();
    this.eventMapper = new EventMapper(this.hueController);
  }

  async start() {
    console.log('🚀 Dota 2 → Hue GSI starting...\n');

    // Connect to Hue bridge
    if (HUE_BRIDGE_IP && HUE_USERNAME) {
      try {
        await this.hueController.connect(HUE_BRIDGE_IP, HUE_USERNAME);
        this.isConnected = true;
        console.log(`✅ Connected to Hue bridge at ${HUE_BRIDGE_IP}`);
      } catch (error) {
        console.error('❌ Failed to connect to Hue bridge:', error);
        console.log('   Please check your .env configuration');
        process.exit(1);
      }
    } else {
      console.error('❌ Missing Hue bridge configuration');
      console.log('   Please set HUE_BRIDGE_IP and HUE_USERNAME in .env file');
      process.exit(1);
    }

    // Start GSI server
    this.gsiServer.on('gamestate', (state: GameState) => {
      this.handleGameState(state);
    });

    this.gsiServer.start(PORT);
    
    console.log(`\n📡 GSI Server listening on port ${PORT}`);
    console.log('📝 Make sure gamestate_integration_hue.cfg is in your Dota 2 cfg folder');
    console.log('   Path: ~/.steam/steam/steamapps/common/dota 2 beta/game/dota/cfg/\n');
  }

  private handleGameState(state: GameState) {
    if (!this.isConnected) return;

    // Detect events by comparing with previous state
    const events = this.gsiServer.detectEvents(this.previousState, state);
    
    // Process each event
    for (const event of events) {
      console.log(`⚡ Event: ${event.type}`);
      this.eventMapper.handleEvent(event, state);
    }

    // Update health-based lighting
    if (state.hero?.health_percent !== undefined) {
      this.eventMapper.updateHealthEffect(state.hero.health_percent);
    }

    this.previousState = state;
  }
}

// Start the application
const app = new Dota2HueGSI();
app.start().catch(error => {
  console.error('Failed to start:', error);
  process.exit(1);
});