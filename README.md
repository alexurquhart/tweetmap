[![Build Status](https://travis-ci.org/cdn-madness/tweetmap.svg)](https://travis-ci.org/cdn-madness/tweetmap) [![Coverage Status](https://coveralls.io/repos/cdn-madness/tweetmap/badge.svg)](https://coveralls.io/r/cdn-madness/tweetmap)
#TweetMap
**tweetmap** is a set of applications written Go, SQL, and HTML/CSS/TypeScript that I used to create the [Ottawa Tweet Mapper](http://tweet.alexurquhart.com). I have tried to follow the [microservices](http://microservices.io) pattern for this project as much as possible, and my end goal is having everything dockerized and capable of scaling up to many different monitoring areas, on many different machines.

##How it works
A tweet makes its way into the system through the watcher application. The watcher listens to the twitter firehose and filters out non-geolocated tweets, and geolocated tweets that are not within the given bounding box. The tweet is inserted into the geodatabase, serialized into a protocol buffer, then broadcast via ZMQ to any listening applications to either be broadcast over websocket, or to be cached for display in the website.

##Components
+ **lib** - Written in Go, this library provides helper functions to serialize/deserialize tweets from the Twitter API stream.
+ **protobuf** - Protocol buffer type and helper functions.
+ **watcher** - Utilizes the library to listen to the Twitter firehose, filter out tweets, insert them into the geodatabase, and broadcast them over ZMQ.
+ **database** - Postgresql/PostGIS database used to store the tweets.
+ **feed** - Listens to the ZMQ feed, deserializes the tweets, and re-broadcasts them over a websocket. Keeps track of the number of connected users.
+ **website** - Serves the static website, as well as the JSON API for tweet statistics.

##TODO List
+ Drop dependency on ZMQ to something pure Go
+ Drop dependency on protocol buffers
+ Fork the twitterstream repo and modify it to use channels/pipelining, and also save the extra step of serializing/deserializing to protocol buffers
+ Save URL's in the tweet database
+ Convert emoji's in the tweet text to images.
