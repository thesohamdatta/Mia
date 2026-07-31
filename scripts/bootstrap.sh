#!/usr/bin/env bash
set -euo pipefail

# MIA Bootstrap Script
# This script sets up the MIA (Machine Intelligence Architecture) environment.

MIA_DIR="${HOME}/.mia"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_FILE="${MIA_DIR}/bootstrap.log"

# Ensure we can log
mkdir -p "${MIA_DIR}"
exec > >(tee -a "${LOG_FILE}") 2>&1

echo "=== MIA Bootstrap Started at $(date) ==="
echo "Repository directory: ${REPO_DIR}"
echo "Target installation directory: ${MIA_DIR}"

# Check for Bun
if ! command -v bun &> /dev/null; then
    echo "Bun is not installed. Please install Bun first (https://bun.sh)."
    echo "On macOS: brew install oven-sh/bun/bun"
    echo "On Linux: curl -fsSL https://bun.sh/install | bash"
    exit 1
fi

echo "Bun version: $(bun --version)"

# Create MIA directory if it doesn't exist
mkdir -p "${MIA_DIR}"

# Copy the repository to the MIA directory (if not already there)
if [ "${REPO_DIR}" != "${MIA_DIR}" ]; then
    echo "Copying MIA source to ${MIA_DIR}..."
    rsync -av --exclude='.git' --exclude='node_modules' --exclude='.DS_Store' "${REPO_DIR}/" "${MIA_DIR}/"
else
    echo "Already in the target directory. Skipping copy."
fi

cd "${MIA_DIR}"

# Initialize a Node.js project if package.json doesn't exist
if [ ! -f "package.json" ]; then
    echo "Creating package.json..."
    cat > package.json << 'EOF'
{
  "name": "mia",
  "version": "0.1.0",
  "description": "Machine Intelligence Architecture - Personal AI Engineering OS",
  "main": "index.js",
  "scripts": {
    "dev": "echo 'Development mode not implemented yet'",
    "build": "echo 'Build script not implemented yet'",
    "start": "echo 'Start script not implemented yet'",
    "test": "echo 'Test script not implemented yet'"
  },
  "keywords": ["ai", "agent", "workflow", "automation"],
  "author": "Soham Datta",
  "license": "MIT",
  "dependencies": {}
}
EOF
fi

# Install dependencies (if any)
echo "Installing dependencies with Bun..."
bun install

# Create a basic bin directory for future binaries
mkdir -p bin

# Create a simple mia executable for now (will be replaced by compiled binary later)
cat > bin/mia << 'EOF'
#!/usr/bin/env bash
# MIA CLI - temporary script until we have a compiled binary
echo "MIA (Machine Intelligence Architecture) CLI"
echo "Version: 0.1.0 (bootstrap)"
echo ""
echo "Available commands:"
echo "  help     - Show this help message"
echo "  version  - Show version information"
echo "  grill    - Start a clarification interview (not implemented yet)"
echo "  plan     - Create a plan (not implemented yet)"
echo ""
echo "This is a placeholder. The full MIA system will be implemented in phases."
EOF
chmod +x bin/mia

# Add bin to PATH for this session (temporary)
export PATH="${MIA_DIR}/bin:${PATH}"

echo ""
echo "=== MIA Bootstrap Complete ==="
echo "To use MIA, run: ${MIA_DIR}/bin/mia --help"
echo "Or add ${MIA_DIR}/bin to your PATH permanently."
echo "Next steps:"
echo "  1. Review the generated files in ${MIA_DIR}"
echo "  2. We will replace the placeholder bin/mia with a compiled Bun binary"
echo "  3. Implement the daemon and skill system"
echo "=================================================="
EOF
chmod +x scripts/bootstrap.sh