# Dota 2 → Philips Hue GSI Integration

Real-time synchronization between Dota 2 game events and Philips Hue smart lights. Your lights react to kills, deaths, abilities, and more.

## Features

- **Real-time Game Sync** - Instant light reactions to game events
- **Smart Effects** - Different light patterns for kills, deaths, ultimates
- **Victory Celebration** - Rainbow effects when you win
- **Health-based Lighting** - Dynamic colors based on hero health
- **Low Latency** - HTTP API with <100ms response time
- **Easy Setup** - Simple configuration with .env file

## Light Effects

| Event | Effect | Description |
|-------|--------|-------------|
| **Kill** | Red pulse | Single kill triggers a red pulse |
| **Killing Spree** | Red flashes | 3+ kills trigger intense flashing |
| **Rampage** | Rainbow | 5+ kills trigger epic rainbow effect |
| **Death** | Fade to darkness | Lights dim during respawn timer |
| **Respawn** | White flash | Bright flash when hero respawns |
| **Ultimate** | Purple pulse | Epic effect when using ultimate |
| **Low Health** | Red breathing | Pulsing red when health < 20% |
| **Victory** | Rainbow celebration | Extended rainbow effect on win |
| **Defeat** | Blue fade | Slow fade to dim blue |

## Prerequisites

- Node.js 16+ or Bun runtime
- Philips Hue Bridge (v2 recommended)
- Philips Hue color-capable lights
- Dota 2 installed
- Local network connection to Hue Bridge

## Installation

1. Clone the repository:
```bash
git clone https://github.com/greenb1rd/dota2-hue-gsi.git
cd dota2-hue-gsi
```

2. Install dependencies:
```bash
npm install
# or if using Bun
bun install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your Hue bridge details:
```env
GSI_PORT=3000
HUE_BRIDGE_IP=192.168.1.100
HUE_USERNAME=your-hue-username
```

## Hue Bridge Setup

### Finding Your Bridge IP

1. Open the Philips Hue app on your phone
2. Go to Settings → Hue Bridges
3. Tap the "i" icon next to your bridge
4. Note the IP address

### Getting a Username

If you don't have a Hue username yet:

1. Run the setup script:
```bash
npm run setup
# or
bun run setup
```

2. When prompted, press the link button on your Hue bridge
3. The script will generate and save your username

## Dota 2 Configuration

1. Copy the GSI configuration file to your Dota 2 cfg folder:

**Windows:**
```bash
copy gamestate_integration_hue.cfg "C:\Program Files (x86)\Steam\steamapps\common\dota 2 beta\game\dota\cfg\"
```

**Linux:**
```bash
cp gamestate_integration_hue.cfg ~/.steam/steam/steamapps/common/dota\ 2\ beta/game/dota/cfg/
```

**macOS:**
```bash
cp gamestate_integration_hue.cfg ~/Library/Application\ Support/Steam/steamapps/common/dota\ 2\ beta/game/dota/cfg/
```

2. Restart Dota 2

## Usage

1. Start the GSI server:
```bash
npm start
# or
bun start
```

2. Launch Dota 2 and start a game

3. Your lights will automatically sync with game events!

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GSI_PORT` | Port for GSI server | 3000 |
| `HUE_BRIDGE_IP` | IP address of your Hue bridge | Required |
| `HUE_USERNAME` | Hue API username | Required |
| `HUE_LIGHT_IDS` | Comma-separated light IDs (optional) | All lights |

### Advanced Configuration

To use specific lights only:
```env
HUE_LIGHT_IDS=1,2,5
```

## Troubleshooting

### Lights not responding

1. Check your Hue bridge is powered and connected to your network
2. Verify the IP address hasn't changed
3. Ensure your username is valid (re-run setup if needed)
4. Check all lights are powered on

### GSI not connecting

1. Verify `gamestate_integration_hue.cfg` is in the correct folder
2. Check firewall isn't blocking port 3000
3. Restart Dota 2 after adding the config file
4. Try a different port if 3000 is in use

### Performance issues

- The HTTP API has inherent latency (50-200ms)
- For ultra-low latency, consider the [Premium Version](https://github.com/greenb1rd/dota2-hue-pro) with native UDP streaming

## Development

### Project Structure
```
dota2-hue-gsi/
├── src/
│   ├── index.ts           # Main server
│   ├── gsi-server.ts      # GSI data handler
│   ├── hue-controller.ts  # Hue bridge communication
│   ├── event-mapper.ts    # Event → Light effect mapping
│   └── types/
│       └── gsi-types.ts   # TypeScript definitions
├── .env.example           # Environment template
├── gamestate_integration_hue.cfg  # Dota 2 config
└── package.json
```

### Adding New Effects

Edit `src/event-mapper.ts` to add custom effects:

```typescript
private async onCustomEvent(): Promise<void> {
  await this.hue.setLightColor({ r: 1.0, g: 0.0, b: 1.0 }, 1.0, 5);
}
```

### Building from Source

```bash
npm run build
# or
bun build src/index.ts --outdir dist --target node
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-effect`)
3. Commit your changes (`git commit -m 'Add new effect'`)
4. Push to the branch (`git push origin feature/new-effect`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Powered by [Philips Hue API](https://developers.meethue.com/)
- Built for the Dota 2 community
- Inspired by gaming peripheral RGB ecosystems

## Support

- 🐛 [Report bugs](https://github.com/greenb1rd/dota2-hue-gsi/issues)
- 💬 [Discord community](https://discord.gg/greenb1rd)
- 📧 Email: contact@greenbird.fun

---

**Disclaimer:** This project is not affiliated with Valve Corporation or Signify (Philips Hue). Dota 2 is a registered trademark of Valve Corporation.