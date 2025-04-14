.PHONY: up down install build preview clean lint

# Start development server
up:
	pnpm dev

# Stop development server (if running)
down:
	@echo "Stopping development server..."
	-pkill -f "astro dev" || true

# Install dependencies
install:
	pnpm install

# Build for production
build:
	pnpm build

# Preview production build
preview:
	pnpm preview

# Clean build artifacts
clean:
	rm -rf dist
	rm -rf .astro

# Run linting
lint:
	pnpm astro check

# Default target
all: install up

help:
	@echo "Available commands:"
	@echo "  make up        - Start development server"
	@echo "  make down      - Stop development server"
	@echo "  make install   - Install dependencies"
	@echo "  make build     - Build for production"
	@echo "  make preview   - Preview production build"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make lint      - Run linting"
	@echo "  make all       - Install and start development server"
	@echo "  make help      - Show this help message" 