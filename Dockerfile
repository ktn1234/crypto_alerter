### STAGE 1: Build ###
# Linux x64
FROM node:14.15.3-alpine3.12 AS BUILD

# Set environmental variables
ENV HUSKY_SKIP_INSTALL=1

# Create directory in container image for app code
RUN mkdir -p /app

# Copy app code (.) to /app in container image
COPY . /app

# Set working directory context
WORKDIR /app

# Install dependencies from packages.json and build
RUN npm install
RUN npm run build

### STAGE 2: Run ###
FROM node:14.15.3-alpine3.12
LABEL maintainer="ktn1234"

# Build args
ARG BUILD_DATE
ARG SLACK_APP_TOKEN
ARG SLACK_CHANNEL_ID
ARG MESSARI_API_KEY
ARG COIN_MARKETCAP_API_KEY

# Set environmental variables
ENV SLACK_APP_TOKEN=${SLACK_APP_TOKEN}
ENV SLACK_CHANNEL_ID=${SLACK_CHANNEL_ID}
ENV MESSARI_API_KEY=${MESSARI_API_KEY}
ENV COIN_MARKETCAP_API_KEY=${COIN_MARKETCAP_API_KEY}

# Labels for build
LABEL org.label-schema.schema-version="1.0"
LABEL org.label-schema.build-date=${BUILD_DATE}
LABEL org.label-schema.description="Crypto Slack Alerter"

# Create directory in container image for app code
RUN mkdir -p /app

# Set working directory context
WORKDIR /app

COPY --from=build /app/build /app/build
COPY --from=build /app/node_modules /app/node_modules

# Command for container to execute
ENTRYPOINT [ "node", "build" ]