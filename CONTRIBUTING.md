# Contributing to Dota 2 → Philips Hue GSI Integration

Thank you for your interest in contributing! We welcome contributions from the community to make this project even better.

## How to Contribute

### Reporting Issues

- Check existing issues before creating a new one
- Use descriptive titles and provide detailed information
- Include steps to reproduce bugs
- Mention your environment (OS, Node.js version, Hue Bridge model)

### Suggesting Features

- Open an issue with the "enhancement" label
- Describe the feature and its use case
- Explain how it benefits users
- Consider implementation complexity

### Pull Requests

1. **Fork the Repository**
   ```bash
   git clone https://github.com/greenb1rd/dota2-hue-gsi.git
   cd dota2-hue-gsi
   npm install
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Your Changes**
   - Follow existing code style and conventions
   - Add TypeScript types for new code
   - Update documentation if needed
   - Test your changes thoroughly

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```
   
   Follow conventional commits:
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test additions or changes
   - `chore:` Maintenance tasks

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```
   Then create a Pull Request on GitHub

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing indentation (2 spaces)
- Use meaningful variable and function names
- Add JSDoc comments for public functions
- Keep functions small and focused

### Testing

Before submitting:
- Run `npm run lint` to check types
- Run `npm run build` to ensure compilation
- Test with actual Dota 2 gameplay
- Verify Hue light effects work correctly

### Adding New Light Effects

When adding new game events or light effects:

1. Update `src/types/gsi-types.ts` with new event types
2. Add event detection in `src/gsi-server.ts`
3. Map the event to a light effect in `src/event-mapper.ts`
4. Implement the effect in `src/hue-controller.ts`
5. Update README.md with the new feature

Example:
```typescript
// In event-mapper.ts
case 'aegis_pickup':
  return {
    effect: 'pulse',
    color: { r: 255, g: 215, b: 0 }, // Gold
    duration: 3000,
    intensity: 'high'
  };
```

## Project Structure

```
src/
├── index.ts           # Main entry point
├── gsi-server.ts      # GSI data receiver
├── hue-controller.ts  # Hue API interface
├── event-mapper.ts    # Event → Effect mapping
└── types/
    └── gsi-types.ts   # TypeScript definitions
```

## Resources

- [Dota 2 GSI Documentation](https://github.com/antonpup/Dota2GSI)
- [Philips Hue API](https://developers.meethue.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## Community

- Be respectful and inclusive
- Help others in issues and discussions
- Share your custom light effects
- Provide constructive feedback

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

Thank you for helping improve the Dota 2 → Philips Hue experience!