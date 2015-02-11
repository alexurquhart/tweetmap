/// <reference path="types/knockout/knockout.d.ts"/>
/// <reference path="Feed.ts"/>
/// <reference path="Map.ts"/>

var map: TweetMap = new TweetMap;

var feed: Feed = new Feed('ws://tweet.alexurquhart.com/ws/', (tweet: Tweet) => { map.addTweet(tweet); });
