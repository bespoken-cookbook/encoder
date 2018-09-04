# Pull base image.
FROM ubuntu:14.04

# Install Node.js
RUN sudo apt-get update
RUN sudo apt-get install --yes curl
RUN curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
RUN sudo apt-get install -y nodejs
RUN sudo apt-get install --yes build-essential
RUN sudo apt-get install --yes software-properties-common
RUN sudo add-apt-repository --yes ppa:kirillshkrogalev/ffmpeg-next
RUN sudo apt-get update
RUN sudo apt-get install --yes ffmpeg

#  Defines your runtime(define default command)
# These commands unlike RUN (they are carried out in the construction of the container) are run when the container
CMD [ "node" ]


