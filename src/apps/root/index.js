/*
    Root Actor
*/

import { Machine } from '../../sm/sm';

const machine = new Machine();

machine.define_role({
  name: "author",
  conditions: ({user}) => user.role=="author",
  events: {
    toggle: {
      transitions: [
        {from: 'created', to: 'submitted',
          action: ({target, user}) => {
              console.log("Do something with target object", target);
              return "ok";
          }
        },
        {from: 'submitted', to: 'created',
          action: ({target, user}) => console.log("Do more with target object", target)
        },
      ]
    }
  }
});

machine.define_role({
  name: "editor",
  conditions: ({user}) => user.role=="editor",
  events: {
    toggle: {
      transitions: [
        {from: 'created', to: 'submitted'},
        {from: 'submitted', to: 'created'},
      ]
    }
  }
});



export default (ctx) => {
    console.log("define root");



    return {
        machine: () => { return machine }
    };
};
