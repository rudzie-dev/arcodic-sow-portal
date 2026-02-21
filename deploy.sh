#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting deployment...${NC}\n"

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository. Run 'git init' first.${NC}"
    exit 1
fi

# Stage all changes
echo -e "${YELLOW}📦 Staging changes...${NC}"
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo -e "${YELLOW}⚠️  No changes to commit${NC}"
else
    # Commit with timestamp
    TIMESTAMP=$(date "+%Y-%m-%d %H:%M:%S")
    echo -e "${YELLOW}💾 Committing changes...${NC}"
    git commit -m "Deploy: $TIMESTAMP"
fi

# Push to remote
echo -e "${YELLOW}☁️  Pushing to remote...${NC}"
git push origin main || git push origin master

echo -e "\n${GREEN}✅ Deployment complete!${NC}"
