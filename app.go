package main

import (
	"context"
	"fmt"

	_ "embed"

	"github.com/tidwall/gjson"
)

//go:embed wails.json
var wailsJSON string

// App struct
type App struct {
	ctx context.Context
}

type QueryResult struct {
	Result  []map[string]interface{} `json:"result" ts_type:"{[key: string]: string}[]"`
	Columns []string                 `json:"columns"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Get app version from wails.json file
func (a *App) GetAppVersion() string {
	version := gjson.Get(wailsJSON, "info.productVersion")
	return version.String()
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func (a *App) MssqlQuery(server string, user string, password string, database string, query string) (*QueryResult, error) {
	db, err := getDBConnection(server, user, password, database)
	if err != nil {
		return nil, err
	}

	result, columns, err := execQuery(db, query)
	if err != nil {
		return nil, err
	}

	println("query executed!")

	return &QueryResult{
		Result:  result,
		Columns: columns,
	}, nil
}
