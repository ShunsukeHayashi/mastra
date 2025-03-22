#!/bin/bash
# Fix database permissions on startup
if [ -f .mastra/mastra.db ]; then
  chmod 664 .mastra/mastra.db
fi
