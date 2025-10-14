package config

import "os"

const Development = "development"

func GetEnvironment() string {
	if value, exists := os.LookupEnv("APP_ENV"); exists {
		return value
	}

	return Development
}
