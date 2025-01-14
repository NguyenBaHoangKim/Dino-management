import mongoose from 'mongoose'
//import mongoose_delete from 'mongoose-delete'

class BaseModel {
    constructor(schema) {
        this.schema = schema

        this.schema.add({
            created_by: {
                type: String,
            },
            updated_by: {
                type: String,
            },
        })

        //this.schema.plugin(mongoose_delete, { deletedAt: true, overrideMethods: 'all' })
    }

    createModel(modelName) {
        return mongoose.model(modelName, this.schema)
    }
}

export default BaseModel
