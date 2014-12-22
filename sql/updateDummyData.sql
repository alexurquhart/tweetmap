UPDATE tweetwatcher.tweets
SET "dateAdded"=current_date + date_part('hour', "dateAdded") * '1 hour'::interval + date_part('minute', "dateAdded") * '1 minute'::interval + date_part('second', "dateAdded") * '1 second'::interval;

UPDATE tweetwatcher."tweetHashtags_rel"
SET "dateAdded"=current_date + date_part('hour', "dateAdded") * '1 hour'::interval + date_part('minute', "dateAdded") * '1 minute'::interval + date_part('second', "dateAdded") * '1 second'::interval;

UPDATE tweetwatcher.pictures
SET "dateAdded"=current_date + date_part('hour', "dateAdded") * '1 hour'::interval + date_part('minute', "dateAdded") * '1 minute'::interval + date_part('second', "dateAdded") * '1 second'::interval;
