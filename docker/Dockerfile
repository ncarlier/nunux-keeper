# Keeper Docker image.
#
# VERSION               0.0.1
#
# VOLUME: docker run -v ~/src/keeper:/opt/keeper -v ~/var/keeper:/var/opt/keeper --name KEEPER_VOLUMES busybox true
# BUILD:  docker build --rm -t nunux/keeper .
# RUN:    docker run --rm --link mongo-elastic:db --link redis:redis --volumes-from KEEPER_VOLUMES -i -t -p 3000:3000 nunux/keeper

FROM nunux/nodejs

MAINTAINER Nicolas Carlier <https://github.com/ncarlier>

RUN apt-get update

# Install packages
RUN apt-get install -y imagemagick

# Virtual host (for reverse proxy container)
ENV VIRTUAL_HOST keeper.lan
ENV VIRTUAL_PORT 3001

# Env
ENV NODE_ENV development

# Server port
ENV APP_PORT 3000

# Server base URL (Realm)
ENV APP_REALM http://keeper.lan

# Application logger level
ENV APP_LOG debug

# Automatic grant access
ENV APP_AUTO_GRANT_ACCESS true

# Session secret key
ENV APP_SESSION_SECRET NuNUXKeEpR_

# Admin account
ENV APP_ADMIN foo@bar.com

# Application data directory
ENV APP_VAR_DIR /var/opt/keeper

# Download document's resources
ENV APP_DOWNLOADER default

EXPOSE 3000

USER node
ENV HOME /home/node

WORKDIR /opt/keeper

ENTRYPOINT ["/usr/bin/npm"]

CMD ["start"]
