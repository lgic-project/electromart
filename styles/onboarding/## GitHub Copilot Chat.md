## GitHub Copilot Chat

- Extension Version: 0.26.7 (prod)
- VS Code: vscode/1.99.3
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 20.205.243.168 (128 ms)
- DNS ipv6 Lookup: Error (30 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (0 ms)
- Electron fetch (configured): HTTP 200 (424 ms)
- Node.js https: HTTP 200 (3345 ms)
- Node.js fetch: HTTP 200 (413 ms)
- Helix fetch: HTTP 200 (1014 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (10 ms)
- DNS ipv6 Lookup: Error (11 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (11 ms)
- Electron fetch (configured): HTTP 200 (7891 ms)
- Node.js https: timed out after 10 seconds
- Node.js fetch: timed out after 10 seconds
- Helix fetch: timed out after 10 seconds

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).