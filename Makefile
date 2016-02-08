.SILENT :
.PHONY : help volume mount build clean cleanup start rm debug shell test install uninstall

USERNAME:=ncarlier
APPNAME:=keeper
IMAGE:=$(USERNAME)/$(APPNAME)
env?=dev

define docker_run_flags
--rm \
--link mongodb:mongodb \
--link redis:redis \
--link elasticsearch:elasticsearch \
--env-file="./etc/default/$(env).env" \
--env-file="./etc/default/custom.env" \
-P \
-i -t
endef

DOCKER=docker
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
	DOCKER=sudo docker
endif

all: build cleanup

## This help screen
help:
	printf "Available targets:\n\n"
	awk '/^[a-zA-Z\-\_0-9]+:/ { \
		helpMessage = match(lastLine, /^## (.*)/); \
		if (helpMessage) { \
			helpCommand = substr($$1, 0, index($$1, ":")); \
			helpMessage = substr(lastLine, RSTART + 3, RLENGTH); \
			printf "%-15s %s\n", helpCommand, helpMessage; \
		} \
	} \
	{ lastLine = $$0 }' $(MAKEFILE_LIST)

## Make the volume image
volume:
	echo "Building $(APPNAME) volumes..."
	$(DOCKER) run -v $(PWD):/usr/src/$(APPNAME) -v ~/var/$(APPNAME):/var/opt/$(APPNAME) --name $(APPNAME)_volumes busybox true

## Mount volumes
mount:
	$(eval docker_run_flags += --volumes-from $(APPNAME)_volumes)
	echo "Using volumes from $(APPNAME)_volumes"

## Build the image
build:
	echo "Building $(IMAGE) docker image..."
	$(DOCKER) build --rm -t $(IMAGE) .

## Remove the image
clean:
	echo "Removing $(IMAGE) docker image..."
	-$(DOCKER) rmi $(IMAGE)

## Remove dangling images
cleanup:
	echo "Removing dangling docker images..."
	-$(DOCKER) images -q --filter 'dangling=true' | xargs sudo docker rmi

## Start the container
start:
	echo "Starting $(IMAGE) docker image..."
	$(DOCKER) run $(docker_run_flags) --name $(APPNAME) $(IMAGE)

## Delete the container
rm:
	echo "Deleting container $(APPNAME) ..."
	-$(DOCKER) rm $(APPNAME)

## Run the container in debug mode
debug:
	echo "Running $(IMAGE) docker image in DEBUG mode..."
	$(DOCKER) run $(docker_run_flags) -p 3333:8080 --name $(APPNAME) $(IMAGE) run debug

## Run the container with shell access
shell:
	echo "Running $(IMAGE) docker image with shell access..."
	$(DOCKER) run $(docker_run_flags) --entrypoint="/bin/bash" $(IMAGE) -c /bin/bash

## Run the container in test mode
test:
	echo "Running tests..."
	$(DOCKER) run $(docker_run_flags) $(IMAGE) test

## Install as a service (needs root privileges)
install: build
	echo "Install as a service..."
	cp etc/systemd/system/* /etc/systemd/system/
	cp etc/default/$(env).env /etc/default/$(APPNAME)
	cp etc/blacklist.txt /var/opt/$(APPNAME)/
	systemctl daemon-reload
	systemctl enable $(APPNAME)-server
	systemctl restart $(APPNAME)-server
	systemctl enable $(APPNAME)-downloader
	systemctl restart $(APPNAME)-downloader
	systemctl enable $(APPNAME)-backup
	systemctl restart $(APPNAME)-backup
	$(MAKE) cleanup

## Un-install service (needs root privileges)
uninstall:
	echo "Un-install service..."
	systemctl stop $(APPNAME)-server
	systemctl stop $(APPNAME)-downloader
	systemctl stop $(APPNAME)-backup
	rm /etc/systemd/system/keeper-*
	rm /etc/default/$(APPNAME)
	systemctl daemon-reload
	$(MAKE) rm clean

