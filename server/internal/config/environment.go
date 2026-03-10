package config

import "os"

// Development is the default environment name used when APP_ENV is not set.
const Development = "development"

// GetEnvironment returns the runtime environment name sourced from the APP_ENV
// environment variable. If APP_ENV is not set it returns Development.
func GetEnvironment() string {
	if value, exists := os.LookupEnv("APP_ENV"); exists {
		return value
	}

	return Development
}
