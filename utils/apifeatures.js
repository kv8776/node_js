class Apifeatures {
    constructor(query, queryObj) {
        this.query = query;
        this.queryObj = queryObj;
    }

    filter() {
        const cols = ['name', 'section', 'cgpa', 'createdAt', 'studentImage'];
        let new_query = { ...this.queryObj };
        Object.keys(new_query).forEach(key => {
            let index = cols.indexOf(key);
            if (index === -1) {
                delete new_query[key];
            }
        });

        this.query = this.query.find(new_query);
        return this;
    }

    limitfields() {
        if (this.queryObj.fields) {
            const f = this.queryObj.fields.split(',').join(' ');
            this.query = this.query.select(f);
        }
        return this;
    }

    pagination() {
        const page = this.queryObj.page * 1 || 1;
        const limit = this.queryObj.limit * 1 || 10;
        const skip_data = (page - 1) * limit;
        this.query = this.query.skip(skip_data).limit(limit);
        return this;
    }
}

module.exports = Apifeatures;
