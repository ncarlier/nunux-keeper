# Keeper Docker image.
#
# VERSION               0.0.1
#
# VOLUME: docker run -v ~/src/keeper:/opt/keeper -v ~/var/keeper:/var/opt/keeper -name KEEPER_VOLUMES busybox true
# BUILD:  docker build -rm -t nunux/keeper .
# RUN:    docker run -rm -link mongo-elastic:db -volumes-from KEEPER_VOLUMES -i -t -p 3000:3000 nunux/keeper bash
# RUN:    docker run -rm -link mongo-elastic:db -volumes-from KEEPER_VOLUMES -p 3000:3000 nunux/keeper /usr/bin/supervisord

FROM nunux/nodejs

MAINTAINER Nicolas Carlier <https://github.com/ncarlier>

RUN apt-get update

# Install packages
RUN DEBIAN_FRONTEND=noninteractive apt-get install -y imagemagick

# Env
ENV NODE_ENV development

# Server port
ENV APP_PORT 3000

# Server base URL (Realm)
ENV APP_REALM http://localhost:3000

# Application logger level
ENV APP_LOG debug

# Automatic grant access
ENV APP_AUTO_GRANT_ACCESS true

# Session secret key
ENV APP_SESSION_SECRET NuNUXKeEpR_

# Admin account
ENV APP_ADMIN foo@bar.com

# Elastic search URI
#ENV APP_ELASTICSEARCH_URI http://localhost:9200

# MongoDB URI
#ENV APP_MONGO_URI mongodb://localhost/keeper

# Redis URI
#ENV APP_REDIS_URI redis://localhost:6379/5

# Application data directory
ENV APP_VAR_DIR /var/opt/keeper

# Download document's resources
ENV APP_DOWNLOADER default

# Add supervisor conf
ADD supervisord.conf  /etc/supervisor/conf.d/supervisord.conf

EXPOSE 3000

#ENTRYPOINT ["/usr/bin/supervisord"]
