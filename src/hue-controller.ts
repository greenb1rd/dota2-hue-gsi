import axios from 'axios';

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export class HueController {
  private bridgeIp: string = '';
  private username: string = '';
  private baseUrl: string = '';
  private lights: string[] = [];
  private isConnected: boolean = false;

  async connect(bridgeIp: string, username: string): Promise<void> {
    this.bridgeIp = bridgeIp;
    this.username = username;
    this.baseUrl = `http://${bridgeIp}/api/${username}`;

    try {
      // Test connection and get lights
      const response = await axios.get(`${this.baseUrl}/lights`);
      this.lights = Object.keys(response.data);
      this.isConnected = true;
      console.log(`   Found ${this.lights.length} lights: ${this.lights.join(', ')}`);
    } catch (error: any) {
      if (error.response?.data?.[0]?.error?.type === 1) {
        throw new Error('Unauthorized user. Please press the link button on your Hue bridge and try again.');
      }
      throw error;
    }
  }

  async setLightColor(rgb: RGB, brightness: number = 254, transitionTime: number = 4): Promise<void> {
    if (!this.isConnected) return;

    const xy = this.rgbToXy(rgb.r, rgb.g, rgb.b);
    
    const state = {
      on: true,
      xy: xy,
      bri: Math.round(brightness * 254),
      transitiontime: transitionTime
    };

    // Apply to all lights
    const promises = this.lights.map(lightId => 
      this.setLightState(lightId, state).catch(err => 
        console.error(`Failed to set light ${lightId}:`, err.message)
      )
    );

    await Promise.all(promises);
  }

  async pulse(rgb: RGB, duration: number = 1000): Promise<void> {
    if (!this.isConnected) return;

    // Pulse effect: bright -> dim -> bright
    await this.setLightColor(rgb, 1.0, 2); // Fast to bright
    await this.sleep(duration / 2);
    await this.setLightColor(rgb, 0.3, 2); // Fast to dim
    await this.sleep(duration / 2);
    await this.setLightColor(rgb, 0.7, 4); // Return to normal
  }

  async flash(rgb: RGB, times: number = 2, interval: number = 300): Promise<void> {
    if (!this.isConnected) return;

    for (let i = 0; i < times; i++) {
      await this.setLightColor(rgb, 1.0, 0); // Instant bright
      await this.sleep(interval);
      await this.turnOff(0); // Instant off
      await this.sleep(interval);
    }
    
    // Return to normal
    await this.setLightColor({ r: 1, g: 1, b: 1 }, 0.7, 4);
  }

  async rainbow(duration: number = 5000): Promise<void> {
    if (!this.isConnected) return;

    const colors: RGB[] = [
      { r: 1.0, g: 0.0, b: 0.0 }, // Red
      { r: 1.0, g: 0.5, b: 0.0 }, // Orange
      { r: 1.0, g: 1.0, b: 0.0 }, // Yellow
      { r: 0.0, g: 1.0, b: 0.0 }, // Green
      { r: 0.0, g: 0.0, b: 1.0 }, // Blue
      { r: 0.5, g: 0.0, b: 1.0 }, // Purple
    ];

    const stepDuration = duration / colors.length;
    const transitionTime = Math.round(stepDuration / 100); // In deciseconds

    for (const color of colors) {
      await this.setLightColor(color, 1.0, transitionTime);
      await this.sleep(stepDuration);
    }
  }

  async turnOff(transitionTime: number = 4): Promise<void> {
    if (!this.isConnected) return;

    const state = {
      on: false,
      transitiontime: transitionTime
    };

    const promises = this.lights.map(lightId => 
      this.setLightState(lightId, state).catch(err => 
        console.error(`Failed to turn off light ${lightId}:`, err.message)
      )
    );

    await Promise.all(promises);
  }

  async reset(): Promise<void> {
    if (!this.isConnected) return;
    
    // Set to warm white
    await this.setLightColor({ r: 1.0, g: 0.8, b: 0.6 }, 0.7, 10);
  }

  private async setLightState(lightId: string, state: any): Promise<void> {
    try {
      await axios.put(`${this.baseUrl}/lights/${lightId}/state`, state);
    } catch (error) {
      // Silently handle individual light errors
    }
  }

  private rgbToXy(r: number, g: number, b: number): [number, number] {
    // Apply gamma correction
    r = r > 0.04045 ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = g > 0.04045 ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = b > 0.04045 ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;

    // Convert to XYZ
    const X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    const Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    const Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    // Convert to xy
    const sum = X + Y + Z;
    if (sum === 0) {
      return [0.3127, 0.3290]; // Default white
    }

    return [X / sum, Y / sum];
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}