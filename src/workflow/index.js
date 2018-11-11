
const mongoose = require('mongoose');


// Create Base Schema
const workflowSchema = new mongoose.Schema(
    {
        type: String,
        _meta: Object
    },
//    { collection: 'workflows' }
);


// Add State Machine Methods and Data Fields to the Schema
import { sm_mongo_plugin } from './sm';
sm_mongo_plugin(workflowSchema);


class MongoWorkflow {
    static apps = {};

    static sendEventToId(id, args, cb) {
        //console.log("send_event_to(id, args)");
//        this.findActor(id, function (err, wf) {
        this.findById(id, function (err, wf) {
            wf.send_event(args, cb);
            //wf.machine.process_event_with_target(wf, args);
            //if(typeof cb == "function")
            //    cb(err, wf);
        });
    }

    static registerApp(name, app) {
        this.apps = this.apps || {};
        this.apps[name] = app;
    }
    static findApp(name) {
        return this.apps ? this.apps[name] : null;
    }

    static loadApps(base_path, apps_list) {
        console.log("base_path: ", base_path);
        for(let app_name of apps_list) {
            let app = require(base_path + '/' + app_name.toLowerCase() + '/').default({});
            Workflow.registerApp(
                app.app_name,
                app
            );
        }
    }

}

workflowSchema.loadClass(MongoWorkflow);
workflowSchema.post('init', function(wf) {
    wf.attach_machine( Workflow.findApp(wf._meta.app).machine() );
});


const Workflow = mongoose.model('Workflow', workflowSchema);



export { Workflow };

