/* RemodelDb.js

   Everything related to ship remodels

*/
(function() {
    "use strict";

    window.RemodelDb = {
        _db: null,
        // NOTE: masterData on init is optional
        // as long as pre-processed data has been saved in localStorage
        init: function(masterData) {
            // load stored db if any
            if (typeof localStorage.remodelDb !== 'undefined')
                this._db = JSON.parse( localStorage.remodelDb );

            if (masterData && this.requireUpdate(masterData)) {
                try {
                    var db = this.mkDb(masterData);
                    localStorage.remodelDb = JSON.stringify(db);
                    this._db = db;
                    console.log("RemodelDb: database updated");
                } catch (e) {
                    console.error("RemodelDb:",e);
                }
            } else {
                console.log("RemodelDb: no update required");
            }

            if (! this._db) {
                console.warn("RemodelDb: database unavailable, need to re-initialize with master data");
            }
        },
        // compare master data against _db (could be null)
        // if this function returns true, then we need to perform a db update
        requireUpdate: function(masterData) {
            if (!this._db)
                return true;
            if (this._db.shipCount !== masterData.api_mst_ship.length ||
                this._db.upgradeCount !== masterData.api_mst_shipupgrade.length)
                return true;
            return false;
        },
        mkDb: function(masterData) {
            // step 1: collect remodel info
            /*
               remodelInfo[ shipId  ] =
                 { ship_id_from: Int
                 , ship_id_to: Int
                 , level: Int
                 , steel: Int
                 , ammo: Int
                 , catapult: Int
                 , blueprint: Int
                 , devmat: Int
                 }
             */
            var remodelInfo = {};
            // all ship Ids (except abyssals)
            var shipIds = [];
            // all ship Ids that appears in x.aftershipid
            // stored as a set.
            var shipDstIds = {};

            $.each(masterData.api_mst_ship, function(i,x){
                if (x.api_id >= 500)
                    return;
                shipIds.push( x.api_id );
                var shipId_to = parseInt(x.api_aftershipid,10) || 0;
                if (shipId_to === 0)
                    return;

                shipDstIds[shipId_to] = true;
                var remodel =
                    { ship_id_from: x.api_id,
                      ship_id_to: shipId_to,
                      level: x.api_afterlv,
                      // yes, this is steel
                      steel: x.api_afterfuel,
                      ammo: x.api_afterbull,
                      // these fields are unknown for now
                      catapult: 0,
                      blueprint: 0,
                      devmat: 0
                    }
                remodelInfo[x.api_id] = remodel;

            });

            function id2name(id) {
                return KC3Meta.shipName( KC3Master.ship(id).api_name );
            }

            $.each(masterData.api_mst_shipupgrade, function(i,x) {
                if (x.api_current_ship_id === 0)
                    return;
                var remodel = remodelInfo[x.api_current_ship_id];
                console.assert(
                    remodel.ship_id_to === x.api_id,
                    "data inconsistent:"+x.api_id);
                remodel.catapult = x.api_catapult_count;
                remodel.blueprint = x.api_drawing_count;
                remodelInfo[x.api_current_ship_id] = remodel;
            });

            // patch devmat info, can't find it in api_start2
            console.assert( remodelInfo[461].ship_id_to === 466 );
            remodelInfo[461].devmat = 15;
            console.assert( remodelInfo[462].ship_id_to === 467 );
            remodelInfo[462].devmat = 15;
            console.assert( remodelInfo[466].ship_id_to === 461 );
            remodelInfo[461].devmat = 10;
            console.assert( remodelInfo[461].ship_id_to === 466 );
            remodelInfo[462].devmat = 10;

            // step 2: get all original ship ids
            // an original ship can only remodel into other ships
            // but is never a remodel target
            var originalShipIds = [];
            $.each( shipIds, function(i,x) {
                if (!shipDstIds[x])
                    originalShipIds.push(x);
            });

            /*
               remodelGroups[ originalShipId  ] =
                 { origin: shipId
                 // circular-remodels are all considered final forms
                 , final_forms: [shipId]
                 // all forms of one kanmusu
                 , group: [shipId]
                 }
             */
            var remodelGroups = {};
            // reverse from shipId to orginal
            var originOf = {};

            $.each( originalShipIds, function(i, x) {
                var group = [x];
                var cur = x;
                while (typeof remodelInfo[cur] !== 'undefined' &&
                       group.indexOf(remodelInfo[cur].ship_id_to) === -1) {
                    cur = remodelInfo[cur].ship_id_to;
                    group.push( cur );
                }

                cur = group[group.length-1];
                var final_forms = [ cur ];
                while (typeof remodelInfo[cur] !== 'undefined' &&
                       final_forms.indexOf(remodelInfo[cur].ship_id_to) === -1) {
                    cur = remodelInfo[cur].ship_id_to;
                    final_forms.push( cur );
                }

                remodelGroups[x] =
                    { origin: x,
                      group: group,
                      final_forms: final_forms,
                    }

                $.each(group, function(j,y) {
                    originOf[y] = x;
                });
            });

            return { remodelInfo: remodelInfo,
                     remodelGroups: remodelGroups,
                     originOf: originOf,
                     // this 2 numbers are "checksum"s, if master data does not change
                     // on this 2 numbers, we don't recompute
                     shipCount: masterData.api_mst_ship.length,
                     upgradeCount: masterData.api_mst_shipupgrade.length
                   };
        }
    }
})();
