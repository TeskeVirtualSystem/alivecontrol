using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;


namespace AliveControl
{
    public class DRBD
    {
        public String version = "";
        public String srcversion = "";
        public DRBDConn[] conns = new DRBDConn[0];
        public Boolean has = false;
        public String drbdfile = "";


        public JObject GetACObj()
        {
            JObject obj = new JObject();
            JArray connarr = new JArray();
            obj["version"] = version;
            obj["srcversion"] = srcversion;
            foreach (var i in conns)
            {
                connarr.Add(i.GetACObj());
            }
            obj["conn"] = connarr;
            obj["drbdfile"] = drbdfile;
            return obj;
        }
    }
}
