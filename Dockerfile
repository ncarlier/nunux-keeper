# Nunux Keeper Docker image.
#
# VERSION 0.0.1

FROM ncarlier/nodejs

MAINTAINER Nicolas Carlier <https://github.com/ncarlier>

# Install packages
RUN apt-get update && apt-get install -y imagemagick

# Add files
ADD . /opt/keeper

# Create var directory and fix rights
RUN mkdir /var/opt/keeper && \
    chown node.node -R /opt/keeper && \
    chown node.node -R /var/opt/keeper

# Def. working directory
WORKDIR /opt/keeper

# Def. user
USER node
ENV HOME /home/node

# Install App
RUN npm install

# Main port
EXPOSE 3000

# Debug port
EXPOSE 8080

ENTRYPOINT ["/usr/bin/npm"]

CMD ["start"]
