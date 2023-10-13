export namespace main {
	
	export class QueryResult {
	    result: {[key: string]: string}[];
	    columns: string[];
	
	    static createFrom(source: any = {}) {
	        return new QueryResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.result = source["result"];
	        this.columns = source["columns"];
	    }
	}

}

