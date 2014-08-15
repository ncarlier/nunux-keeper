# Nunux Keeper Docker image.
#
# VERSION 0.0.1
#
# BUILD:  docker build --rm -t ncarlier/keeper .

FROM ncarlier/nodejs

MAINTAINER Nicolas Carlier <https://github.com/ncarlier>

# Install packages
RUN apt-get update && apt-get install -y imagemagick

# Port
EXPOSE 3000

# Add files
ADD . /opt/keeper
WORKDIR /opt/keeper
RUN chown node.node -R /opt/keeper

# Def. user
USER node
ENV HOME /home/node

# Install App
RUN npm install

ENTRYPOINT ["/usr/bin/npm"]

CMD ["start"]
