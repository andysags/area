FROM reactnativecommunity/react-native-android:latest

WORKDIR /app

COPY package.json yarn.lock* ./
RUN npm install

# Copy entire project first to install npm dependencies
COPY . .

# Install npm dependencies
RUN npm install

# Reset workdir
WORKDIR /app

# Run build script at runtime
CMD ["/bin/bash", "/app/build-apk.sh"]
