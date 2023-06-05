package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"

	_ "github.com/microsoft/go-mssqldb"
)

func getDBConnection(server string, user string, password string, database string) (*sql.DB, error) {
	println("Starting mssql connection!")

	connectionString := "server=" + server +
		";user id=" + user +
		";password=" + password +
		";database=" + database +
		";encrypt=disable"

	// Create connection pool
	db, err := sql.Open("sqlserver", connectionString)
	if err != nil {
		println("Error creating connection pool: ", err.Error())
		return nil, err
	}

	// Verify the database connection
	ctx := context.Background()
	err = db.PingContext(ctx)
	if err != nil {
		println(err.Error())
		return nil, err
	}

	return db, nil
}

func execQuery(db *sql.DB, query string) (result []map[string]interface{}, columns []string, err error) {

	// Execute the query and retrieve the result set
	rows, err := db.Query(query)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	// Initialize the result with empty slice
	result = make([]map[string]interface{}, 0)

	// Retrieve the column names & types from the result set
	columnTypes, _ := rows.ColumnTypes()
	columns, _ = rows.Columns()

	// Create a slice interface to be used for raw scan
	values := make([]interface{}, len(columns))
	for i := range values {
		values[i] = new(interface{})
		if columns[i] == "" {
			columns[i] = fmt.Sprintf("column-%d", i+1)
		}
	}

	// Loop through the result set and build row map and add it to the results
	for rows.Next() {
		// Initialize a raw map
		rowMap := make(map[string]interface{})

		// Scan the values from the result set into the slice
		err = rows.Scan(values...)
		if err != nil {
			return nil, nil, err
		}

		// Loop through the columns and set the key/value pairs in the map
		for i, colName := range columns {
			val := *(values[i].(*interface{}))

			// Handle decimal type and convert it to json numnber
			byteSlice, ok := val.([]uint8)
			if ok && columnTypes[i].DatabaseTypeName() == "DECIMAL" {
				rowMap[colName] = json.Number(byteSlice)
			} else {
				rowMap[colName] = val
			}
		}

		// Append the row map to the results slice
		result = append(result, rowMap)
	}

	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	return result, columns, nil
}
