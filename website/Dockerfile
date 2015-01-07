FROM golang

ADD . $GOPATH/src/alexurquhart/queryserver

RUN go get github.com/cdn-madness/tweetmap
RUN go get github.com/gorilla/mux
RUN go get github.com/lib/pq
RUN go install alexurquhart/queryserver

ENTRYPOINT /go/bin/queryserver
EXPOSE 8080

