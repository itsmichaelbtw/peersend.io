package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	fs := http.FileServer(http.Dir("web"))
	http.Handle("/", fs)

	server := SpawnServer()

	http.HandleFunc("/signal", server.handleConnection)

	fmt.Printf("Server started on port 8080\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
