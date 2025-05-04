# Usa .NET 7 SDK como base
FROM mcr.microsoft.com/dotnet/sdk:7.0

# Instala Node.js LTS (para el frontend)
RUN apt-get update && apt-get install -y curl gnupg \
  && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
  && apt-get install -y nodejs \
  && npm install -g npm@latest \
  && rm -rf /var/lib/apt/lists/*

# Crea y sitúa el workspace
RUN mkdir /workspace
WORKDIR /workspace

