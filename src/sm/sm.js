

function conditionsToArray(c) {
    if( !Array.isArray(c) ) {
        c = c ? [c] : [];
    }
    return c;
}

/*
class MachineInstance {

    constructor({target, machine}) {
        this.target = target;
        this.machine = machine;
    }

//    deliver_event({name, data, user}={}) {
    send_event(args={}) {
        let result = null;
        args.target = this.target;
        const tr = this.machine.get_available_transitions_for_event( args )[0];
//        console.log("tr: ", tr);
        if(tr) {
//            this.target.state = tr.to;
            this.target.machine_state = tr.to;
            if(tr.action && typeof tr.action == "function")
                result = tr.action.call(this.target, args);
        }
        return result;
    }

}
*/

class Machine {
    schema = {events: {}};

    define_role({ name, conditions, events }={}) {
        const role_conditions = conditionsToArray(conditions);
        if( events && typeof events === 'object' ) {
            Object.entries(events).forEach(([key, event]) => {
                if( !this.schema.events[key] )
                    this.schema.events[key] = { transitions: [] };
                if( event.transitions && Array.isArray(event.transitions) ) {
                    event.transitions.forEach( tr => {
                        tr.conditions = [ ...role_conditions, ...conditionsToArray(tr.conditions) ];
                        this.schema.events[key].transitions.push( tr );
                    });
                }

            });
        }
    }

    get_available_transitions_for_event(args) {
        const {name, target} = args;
        const event_schema = this.schema.events[name];
        let trs = [];
        if(event_schema && event_schema.transitions && Array.isArray(event_schema.transitions)) {
            // from all known transitions for this event
            trs = event_schema.transitions.filter(
                t =>
                    (t.from==target.machine_state || !t.from) && // with appropriate "from" field
                    t.conditions.reduce( // where all conditions are computed to "true"
                        (acc, c) => acc && c.call(target, args),
                        true
                    )
            );
        }
        return trs;
    }

    process_event_with_target(target, args={}, cb) {
        let result = null;
        args.target = target;
        const tr = this.get_available_transitions_for_event( args )[0];
        console.log(">>>>>");
        console.log("target.machine_state before: ", target.machine_state);
        console.log("transition: ", tr);
        if(tr) {
            target.machine_state = tr.to;
            if(tr.action && typeof tr.action == "function")
                result = tr.action.call(target, args);
            console.log("result: ", result);
        }
        console.log("target.machine_state after: ", target.machine_state);
        console.log("<<<<<");
        if(typeof cb == "function")
            cb({}, result);
        return result;
    }

/*
    instance({target}={}) {
        return new MachineInstance({target, machine: this});
    }
*/
}

/*
function state_machine(machine) {
    return function(klass) {
        klass.prototype.send_event = function(args) {
            if( !this.machine_instance ) {
                console.log("set this.machine_instance: ", this.machine_instance);
                this.machine_instance = machine.instance({ target: this });
            }
            this.machine_instance.send_event(args);
        };
    };
}
*/


/*
class MongoWorkflow {
    
    attach_machine(machine) {
        this.machine = machine;
    }

    send_event(args={}) {
        return this.machine.process_event_with_target(this, args);
    }

}
*/

class MongoStateMachineTarget {

    attach_machine(machine) {
        this.machine = machine;
    }

    send_event(args={}, cb) {
        return this.machine.process_event_with_target(this, args, cb);
    }

    set machine_state(v) {
        this.state = v;
        this.save();
    }

    get machine_state() {
        return this.state;
    }

}

function sm_mongo_plugin( schema ) {
    schema.add({
        state: {
          type: String,
          default: 'initial'
        }
    });
    schema.loadClass(MongoStateMachineTarget);
}


export { Machine, sm_mongo_plugin };
