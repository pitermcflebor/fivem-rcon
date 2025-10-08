# 📦 Publishing Guide - FiveM RCON Extension

## Prerequisites

Before publishing the extension to the VS Code Marketplace, you need:

1. **Microsoft/Azure Account**: Create a free account at https://dev.azure.com/
2. **Personal Access Token (PAT)**: 
   - Go to https://dev.azure.com/
   - Click on User Settings → Personal Access Tokens
   - Create a new token with `Marketplace (Manage)` scope
   - **Save the token securely** (you won't be able to see it again)

3. **vsce Tool**: Install the Visual Studio Code Extension Manager
   ```bash
   npm install -g @vscode/vsce
   ```

## 📝 Pre-Publication Checklist

- [ ] Version number updated in `package.json`
- [ ] `CHANGELOG.md` updated with latest changes
- [ ] Both `README.md` (English) and `README.es.md` (Spanish) are up to date
- [ ] All tests pass (if any)
- [ ] Extension works correctly in development mode (F5)
- [ ] No errors when compiling: `npm run compile`
- [ ] Package builds successfully: `vsce package`

## 🚀 Publishing Steps

### Step 1: Create a Publisher

If you don't have a publisher yet:

```bash
vsce create-publisher <your-publisher-name>
```

Example:
```bash
vsce create-publisher brunorcon
```

You'll be prompted for:
- Name (display name)
- Email
- Personal Access Token

### Step 2: Login to Publisher

```bash
vsce login <your-publisher-name>
```

Enter your Personal Access Token when prompted.

### Step 3: Update package.json

Add the publisher to your `package.json`:

```json
{
  "name": "fivem-rcon",
  "publisher": "your-publisher-name",
  "version": "0.0.2",
  ...
}
```

### Step 4: Add Repository Information

Add repository info to `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/fivem-rcon.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/fivem-rcon/issues"
  },
  "homepage": "https://github.com/yourusername/fivem-rcon#readme"
}
```

### Step 5: Package the Extension

```bash
npm run compile
vsce package
```

This will create a `.vsix` file (e.g., `fivem-rcon-0.0.2.vsix`).

### Step 6: Test the Package

Install the `.vsix` file locally to test:

```bash
code --install-extension fivem-rcon-0.0.2.vsix
```

Or from VS Code:
1. Extensions → ... menu → Install from VSIX
2. Select the `.vsix` file
3. Test all functionality

### Step 7: Publish to Marketplace

```bash
vsce publish
```

Or publish a specific version:
```bash
vsce publish 0.0.2
```

Or publish with patch/minor/major increment:
```bash
vsce publish patch  # 0.0.2 -> 0.0.3
vsce publish minor  # 0.0.2 -> 0.1.0
vsce publish major  # 0.0.2 -> 1.0.0
```

## 📋 Post-Publication

After publishing:

1. **Verify on Marketplace**: Visit https://marketplace.visualstudio.com/
2. **Test Installation**: Install from marketplace in a fresh VS Code
3. **Update GitHub Release**: Create a GitHub release with the same version
4. **Announce**: Share on relevant FiveM communities

## 🔄 Updating the Extension

For subsequent updates:

1. Update version in `package.json`
2. Update `CHANGELOG.md`
3. Commit changes
4. Run `vsce publish` (auto-increments version)

## 📊 Monitoring

- **Marketplace Dashboard**: https://marketplace.visualstudio.com/manage
  - View download statistics
  - Read user reviews
  - Monitor ratings

## 🛠️ Common Issues

### "Error: Missing publisher name"
Add publisher to `package.json`:
```json
{
  "publisher": "your-publisher-name"
}
```

### "Error: Make sure to edit the README.md file"
Ensure README.md has substantial content (not just template).

### "ERROR: 'vsce' is not recognized"
Install vsce globally:
```bash
npm install -g @vscode/vsce
```

### "Error: Personal Access Token"
- Token must have `Marketplace (Manage)` scope
- Token must not be expired
- Run `vsce login` again with a new token

## 📚 Useful Commands

```bash
# Package without publishing
vsce package

# List all files that will be published
vsce ls

# Show extension info
vsce show <publisher>.<extension>

# Unpublish (use with caution!)
vsce unpublish
```

## 🔗 Resources

- [Publishing Extensions](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [Extension Manifest](https://code.visualstudio.com/api/references/extension-manifest)
- [Azure DevOps](https://dev.azure.com/)
- [VS Code Marketplace](https://marketplace.visualstudio.com/)

---

**Note**: First publication takes ~5-10 minutes to appear on the marketplace. Updates are usually faster.
