const mongoose = require('mongoose');
const glob = require( 'glob' ), path = require( 'path' );


const url =  sails.config.datastores.default.mongoUrl;
// &replicaSet="+ sails.config.datastores.default.replicaSet;
mongoose.pluralize(null);

let globOptions = {
    cwd: './api/mongoose/models'
};


glob.sync( '*.js' , globOptions).forEach( function( file ) {
    let model = file.slice(0, -3);
    let modelPath = path.resolve(globOptions.cwd, file);
    sails.log("Registering model `"+ model +"` in Mongoose")
    global[model] = mongoose.model(model.charAt(0).toLowerCase() + model.slice(1), require(modelPath));
});


(async () => {
    await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
})().catch(err => {
    sails.log(err);
});


