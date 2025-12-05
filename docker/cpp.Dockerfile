# Minimal C++ runtime with GCC
FROM gcc:13-alpine

# Install minimal dependencies
RUN apk add --no-cache libstdc++

# Create non-privileged user
RUN adduser -D -u 1000 nobody

# Create workspace directory
RUN mkdir /workspace && chown nobody:nobody /workspace

# Set working directory
WORKDIR /workspace

# Switch to non-privileged user
USER nobody

# Default command
CMD ["g++"]
