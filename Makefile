.SILENT :
.PHONY : volume dev build clean cleanup run stop rm shell test publish

USERNAME:=ncarlier
APPNAME:=keeper
IMAGE:=$(USERNAME)/$(APPNAME)

define docker_run_flags
--rm \
--link mongodb:mongodb \
--link redis:redis \
--link elasticsearch:elasticsearch \
--env-file $(PWD)/etc/env.conf \
--dns 172.17.42.1 \
-P \
-i -t
endef

all: build cleanup

volume:
	echo "Building $(APPNAME) volumes..."
	sudo docker run -v $(PWD):/opt/$(APPNAME) -v ~/var/$(APPNAME):/var/opt/$(APPNAME) --name $(APPNAME)_volumes busybox true

dev:
	$(eval docker_run_flags += --volumes-from $(APPNAME)_volumes)
	echo "DEVMODE: Using volumes from $(APPNAME)_volumes"

build:
	echo "Building $(IMAGE) docker image..."
	sudo docker build --rm -t $(IMAGE) .

clean:
	echo "Removing $(IMAGE) docker image..."
	-sudo docker rmi $(IMAGE)

cleanup:
	echo "Removing dangling docker images..."
	-sudo docker images -q --filter 'dangling=true' | xargs sudo docker rmi

run:
	echo "Running $(IMAGE) docker image..."
	sudo docker run $(docker_run_flags) --name $(APPNAME) $(IMAGE)

stop:
	echo "Stopping container $(APPNAME) ..."
	-sudo docker stop $(APPNAME)

rm:
	echo "Deleting container $(APPNAME) ..."
	-sudo docker rm $(APPNAME)

shell:
	echo "Running $(IMAGE) docker image with shell access..."
	sudo docker run $(docker_run_flags) --entrypoint="/bin/bash" $(IMAGE) -c /bin/bash

test:
	echo "Running tests..."
	sudo docker run $(docker_run_flags) $(IMAGE) test

publish:
	ifndef REGISTRY
		$(error REGISTRY is undefined)
	else
		echo "Publish image into the registry..."
		sudo docker tag $(IMAGE) $(REGISTRY)/$(IMAGE)
		sudo docker push $(REGISTRY)/$(IMAGE)
	endif
