package main

import (
	"io"
	"log"
)

var (
	Info    *log.Logger
	Warning *log.Logger
	Error   *log.Logger
)

func initLogger(infoH io.Writer, warningH io.Writer, errorH io.Writer) {
	Info = log.New(infoH, "INFO: ", log.Ldate|log.Ltime|log.Lshortfile)
	Warning = log.New(warningH, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
	Error = log.New(errorH, "WARNING: ", log.Ldate|log.Ltime|log.Lshortfile)
}
