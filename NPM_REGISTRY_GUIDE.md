# NPM Registry & Publishing Guide

This guide explains how to publish your package to npm and optionally set up a private registry.

## Option 1: Publish to Public npm Registry (Recommended)

### Step 1: Create npm Account

1. Go to https://www.npmjs.com/signup
2. Create an account with:
   - Username: Choose your npm username
   - Email: himpraise571@gmail.com
   - Password: Create a strong password

### Step 2: Verify Your Email

Check your email and click the verification link from npm.

### Step 3: Enable Two-Factor Authentication (Recommended)

1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/tfa
2. Enable 2FA for extra security
3. Save your recovery codes in a safe place

### Step 4: Login via Terminal

```bash
npm login
```

Enter your credentials:
- Username
- Password
- Email
- One-time password (if 2FA is enabled)

Verify you're logged in:
```bash
npm whoami
```

### Step 5: Build and Test

```bash
# Clean previous builds
npm run clean

# Build the TypeScript code
npm run build

# Verify the build
ls -la dist/

# Test the package locally
npm link
cleanup --version
cleanup --help
```

### Step 6: Check Package Contents

```bash
# See what will be published
npm pack --dry-run
```

Verify that:
- ✅ `dist/` folder is included
- ✅ `README.md` is included
- ✅ `LICENSE` is included
- ✅ `package.json` is included
- ❌ `src/` is excluded
- ❌ `tests/` is excluded
- ❌ `test-samples/` is excluded
- ❌ Documentation guides are excluded

### Step 7: Publish to npm

```bash
# For first-time publishing
npm publish

# If you need to publish with public access (for scoped packages)
npm publish --access public
```

### Step 8: Verify Publication

1. Go to https://www.npmjs.com/package/code-cleanup-cli
2. Your package should be live!

### Step 9: Test Installation

```bash
# In a different directory
npm install -g code-cleanup-cli

# Test it
cleanup --version
```

---

## Option 2: Private npm Registry (Advanced)

If you want to keep your package private or host your own registry:

### Using Verdaccio (Local Private Registry)

#### Install Verdaccio

```bash
npm install -g verdaccio
```

#### Start Verdaccio

```bash
verdaccio
```

This will start a local registry at http://localhost:4873

#### Configure npm to Use Verdaccio

```bash
# Set registry
npm set registry http://localhost:4873

# Create a user
npm adduser --registry http://localhost:4873
```

#### Publish to Verdaccio

```bash
npm publish --registry http://localhost:4873
```

#### Install from Verdaccio

```bash
npm install -g code-cleanup-cli --registry http://localhost:4873
```

### Using GitHub Packages

#### Configure for GitHub Packages

1. Create a `.npmrc` file in your project:

```
@iampraiez:registry=https://npm.pkg.github.com
```

2. Update `package.json`:

```json
{
  "name": "@iampraiez/code-cleanup-cli",
  "publishConfig": {
    "registry": "https://npm.pkg.github.com"
  }
}
```

3. Create a GitHub Personal Access Token:
   - Go to https://github.com/settings/tokens
   - Generate new token (classic)
   - Select `write:packages` scope
   - Copy the token

4. Login to GitHub Packages:

```bash
npm login --scope=@iampraiez --registry=https://npm.pkg.github.com
```

Use:
- Username: iampraiez
- Password: Your GitHub Personal Access Token
- Email: himpraise571@gmail.com

5. Publish:

```bash
npm publish
```

---

## Updating Your Package

### Version Management

Use semantic versioning (semver):

```bash
# Bug fixes: 1.0.0 → 1.0.1
npm version patch

# New features: 1.0.0 → 1.1.0
npm version minor

# Breaking changes: 1.0.0 → 2.0.0
npm version major
```

### Update Process

1. Make your changes
2. Update `CHANGELOG.md`
3. Bump version:
   ```bash
   npm version patch -m "Release v%s"
   ```
4. Push to GitHub:
   ```bash
   git push && git push --tags
   ```
5. Publish to npm:
   ```bash
   npm publish
   ```

---

## Package Statistics

After publishing, you can track your package:

- **npm page**: https://www.npmjs.com/package/code-cleanup-cli
- **Download stats**: https://npm-stat.com/charts.html?package=code-cleanup-cli
- **Bundle size**: https://bundlephobia.com/package/code-cleanup-cli

---

## Unpublishing (Emergency Only)

⚠️ **Warning**: Only unpublish if absolutely necessary (security issue, etc.)

```bash
# Unpublish specific version
npm unpublish code-cleanup-cli@1.0.0

# Unpublish entire package (within 72 hours of publishing)
npm unpublish code-cleanup-cli --force
```

**Note**: You can only unpublish within 72 hours of publishing.

---

## Troubleshooting

### "Package name already exists"

If the name is taken, you have two options:

1. **Use a scoped package**:
   ```json
   {
     "name": "@iampraiez/code-cleanup-cli"
   }
   ```
   Then publish with:
   ```bash
   npm publish --access public
   ```

2. **Choose a different name**:
   Update `name` in `package.json` to something unique like:
   - `code-cleanup-tool`
   - `cleanup-code-cli`
   - `praiez-code-cleanup`

### "You must verify your email"

Check your email and click the verification link from npm.

### "402 Payment Required"

You're trying to publish a private package. Use:
```bash
npm publish --access public
```

### Build Errors

```bash
# Clean and rebuild
npm run clean
npm install
npm run build
```

---

## Best Practices

1. ✅ **Always test locally** before publishing
2. ✅ **Use semantic versioning** properly
3. ✅ **Update CHANGELOG.md** for each release
4. ✅ **Tag releases** in git
5. ✅ **Keep README.md** up to date
6. ✅ **Monitor downloads** and issues
7. ✅ **Respond to issues** on GitHub
8. ✅ **Keep dependencies** updated

---

## Quick Reference

```bash
# Login to npm
npm login

# Build package
npm run build

# Check package contents
npm pack --dry-run

# Publish
npm publish

# Update version
npm version patch

# View package info
npm view code-cleanup-cli

# Check who you're logged in as
npm whoami
```

---

**Good luck with your package! 🚀**

For questions or issues, visit: https://github.com/iampraiez/code-cleanup-cli/issues
