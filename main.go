package main

import (
	"fmt"
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/connect", server.handleConnection)

	fmt.Printf("Server started on port 8080\n")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
