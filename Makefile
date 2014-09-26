.SILENT :
.PHONY : volume build clean run shell test

USERNAME:=ncarlier
APPNAME:=keeper
IMAGE:=$(USERNAME)/$(APPNAME)

define docker_run_flags
--rm \
--link mongodb:mongodb \
--link redis:redis \
--link elasticsearch:elasticsearch \
--env-file $(PWD)/etc/env.conf \
-P \
-i -t
endef

ifdef DEVMODE
	docker_run_flags += --volumes-from $(APPNAME)_volumes
endif

all: build

volume:
	echo "Building $(APPNAME) volumes..."
	sudo docker run -v $(PWD):/opt/$(APPNAME) -v ~/var/$(APPNAME):/var/opt/$(APPNAME) --name $(APPNAME)_volumes busybox true

build:
	echo "Building $(IMAGE) docker image..."
	sudo docker build --rm -t $(IMAGE) .

clean:
	echo "Removing $(IMAGE) docker image..."
	sudo docker rmi $(IMAGE)

run:
	echo "Running $(IMAGE) docker image..."
	sudo docker run $(docker_run_flags) --name $(APPNAME) $(IMAGE)

shell:
	echo "Running $(IMAGE) docker image with shell access..."
	sudo docker run $(docker_run_flags) --entrypoint="/bin/bash" $(IMAGE) -c /bin/bash

test:
	echo "Running tests..."
	sudo docker run $(docker_run_flags) $(IMAGE) test

