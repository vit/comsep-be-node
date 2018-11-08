
const mongoose = require('mongoose');

import root from './root/';
const root_actor = root({});


// Create Base Schema
const workflowSchema = new mongoose.Schema(
    { type: String },
//    { collection: 'workflows' }
);




// Add State Machine Methods and Data Fields to the Schema
import { sm_mongo_plugin } from '../sm/sm';
sm_mongo_plugin(workflowSchema);



class MongoWorkflow {

/*
    send_event(args={}) {
        let result = null;
//        args.target = this.target;
//        const tr = this.machine().test();

        console.log("send_event() -> this.machine: ", this.machine);
        return result;
    }
*/

    static send_event_to(id, args, cb) {
        //console.log("send_event_to(id, args)");
        this.findActor(id, function (err, wf) {
            wf.send_event(args, cb);
            //wf.machine.process_event_with_target(wf, args);
            //if(typeof cb == "function")
            //    cb(err, wf);
        });
    }

    static findActor(id, cb) {
        //console.log("findActor(id, cb)");
        this.findById(id, function (err, wf) {
            //console.log("findById => (err, wf): ", wf);
            wf.attach_machine( root_actor.machine() );
            //console.log("wf.machine: ", wf.machine);
            if(typeof cb == "function")
                cb(err, wf);
        });
    }

    static findActors(req, cb) {
        this.find(req, function (err, actors) {
            const result = actors.map(a => {
                a.attach_machine( root_actor.machine() );
                return a;
            } );
            if(typeof cb == "function")
                cb(err, result);
        });
    }

}

workflowSchema.loadClass(MongoWorkflow);





const Workflow = mongoose.model('Workflow', workflowSchema);


export { Workflow };

