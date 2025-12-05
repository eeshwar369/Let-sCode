# Minimal Rust runtime
FROM rust:1.75-alpine

# Create non-privileged user
RUN adduser -D -u 1000 nobody

# Create workspace directory
RUN mkdir /workspace && chown nobody:nobody /workspace

# Set working directory
WORKDIR /workspace

# Switch to non-privileged user
USER nobody

# Default command
CMD ["rustc"]
