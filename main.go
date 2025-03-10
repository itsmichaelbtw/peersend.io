package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	server := SpawnServer()

	http.HandleFunc("/signal", server.handleConnection)

	fmt.Printf("Server started on port 8080\n")
	log.Fatal(http.ListenAndServe("localhost:8080", nil))
}
