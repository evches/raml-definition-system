/// <reference path="../typings/main.d.ts" />

import fs = require("fs")
import path = require("path")
import def=require("./definitionSystem")

function generateJSONDumpOfDefSystem( ){
    var universe10 = def.getUniverse("RAML10")
    var universe08 =def.getUniverse("RAML08")
    var universeDeviceProfiles = def.getUniverse("device-profiles")

    function processUniverse10(u) {
        const rt = {};
        u.types().forEach(x=>{
            const props={};
            x.allProperties().forEach(y=>props[y.nameId()]={name:y.nameId()});
            (<def.NodeClass>x).customProperties().forEach(y=>props[y.nameId()]={name:y.nameId(),range:y.range().nameId(),domain:y.domain().nameId()});
            rt[x.nameId()]={
                name:x.nameId(),
                properties:props
            }
        });
        return rt;
    }

    var Universe10 = processUniverse10(universe10);

    function processUniverse8(u) {
      var rt = {}
      u.types().forEach(x=>{
          var props={};
          x.allProperties().forEach(y=>props[y.nameId()]={name:y.nameId(),range:y.range().nameId(),domain:y.domain().nameId()});
          (<def.NodeClass>x).customProperties().forEach(y=>props[y.nameId()]={name:y.nameId()});
          rt[x.nameId()]={

              name:x.nameId(),

              properties:props
          }
      })
      return rt;
    }

    var Universe08 = processUniverse8(universe08)

    var UniverseDeviceProfiles = processUniverse10(universeDeviceProfiles)


    var Universes={
      Universe08: Universe08,
      Universe10: Universe10,
      UniverseDeviceProfiles: UniverseDeviceProfiles
    }
    fs.writeFileSync( path.join(__dirname, '../src/universe.ts' ), "var Universes="+JSON.stringify( Universes, null, 2 )+";export=Universes")
}
generateJSONDumpOfDefSystem();
