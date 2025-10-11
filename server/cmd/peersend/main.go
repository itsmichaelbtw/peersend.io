package main

import (
	"log"
	"net/http"
	"peersend/internal/app"
	"peersend/internal/config"
)

func main() {
	config.Load(config.GetConfigPath("SERVER_CONFIG_PATH", "configs/peersend.yml"))

	mux := http.NewServeMux()
	app.SetupRoutes(mux, config.Get())

	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", mux))
}
